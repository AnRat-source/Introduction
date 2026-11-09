(() => {
  'use strict';

  const EMOJI_PATTERN = /(?:\p{Regional_Indicator}{2}|[#*0-9]\uFE0F?\u20E3|\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\p{Emoji_Modifier})?)*)/gu;
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'CODE', 'PRE', 'KBD', 'SAMP']);
  const observedRoots = new Set();
  let enabled = true;
  let observing = false;
  let scheduled = false;

  const OUTLINE = [45, 34, 53, 255];

  function parentOrHost(element) {
    return element.parentElement || element.getRootNode().host || null;
  }

  function canReplace(node) {
    if (!node.parentElement || node.parentElement.closest('.pixel-emoji')) return false;
    for (let el = node.parentElement; el; el = parentOrHost(el)) {
      if (SKIP_TAGS.has(el.tagName) || el.getAttribute('role') === 'textbox') return false;
    }
    return true;
  }

  function createCanvas(size = 16) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas.setAttribute('aria-hidden', 'true');
    return canvas;
  }

  // Quantize source colours to RGB 3-3-2 (256 total colours) and add a
  // one-cell silhouette. Resolution scales with the rendered emoji size.
  function posterizeAndOutline(canvas) {
    const context = canvas.getContext('2d');
    const { width, height } = canvas;
    const image = context.getImageData(0, 0, width, height);
    const source = new Uint8ClampedArray(image.data);
    const isFilled = (x, y) => x >= 0 && y >= 0 && x < width && y < height && source[(y * width + x) * 4 + 3] === 255;
    const quantize = (value, levels) => Math.round((value * (levels - 1)) / 255) * (255 / (levels - 1));

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;
        if (isFilled(x, y)) {
          image.data[index] = quantize(source[index], 8);
          image.data[index + 1] = quantize(source[index + 1], 8);
          image.data[index + 2] = quantize(source[index + 2], 4);
          image.data[index + 3] = 255;
          continue;
        }
        let touchesEmoji = false;
        for (let offsetY = -1; offsetY <= 1 && !touchesEmoji; offsetY += 1) {
          for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
            if ((offsetX || offsetY) && isFilled(x + offsetX, y + offsetY)) {
              touchesEmoji = true;
              break;
            }
          }
        }
        if (touchesEmoji) image.data.set(OUTLINE, index);
        else image.data[index + 3] = 0;
      }
    }
    context.putImageData(image, 0, 0);
    return canvas;
  }

  // Multi-sample only alpha coverage on a 4×4 sub-pixel grid. The coverage is
  // rounded to 0 or 1, while one centre sample supplies the pixel's colour.
  function downsampleWithMsaa(source, pixels) {
    const samplesPerAxis = 4;
    const sampleCount = samplesPerAxis ** 2;
    const sourceContext = source.getContext('2d', { willReadFrequently: true });
    const sourceData = sourceContext.getImageData(0, 0, source.width, source.height).data;
    const output = createCanvas(pixels);
    const outputContext = output.getContext('2d');
    const image = outputContext.createImageData(pixels, pixels);
    const cellWidth = source.width / pixels;
    const cellHeight = source.height / pixels;

    for (let y = 0; y < pixels; y += 1) {
      for (let x = 0; x < pixels; x += 1) {
        let alphaTotal = 0;
        for (let sampleY = 0; sampleY < samplesPerAxis; sampleY += 1) {
          for (let sampleX = 0; sampleX < samplesPerAxis; sampleX += 1) {
            const sourceX = Math.min(source.width - 1, Math.floor((x + (sampleX + 0.5) / samplesPerAxis) * cellWidth));
            const sourceY = Math.min(source.height - 1, Math.floor((y + (sampleY + 0.5) / samplesPerAxis) * cellHeight));
            const sourceIndex = (sourceY * source.width + sourceX) * 4;
            const alpha = sourceData[sourceIndex + 3] / 255;
            alphaTotal += alpha;
          }
        }
        const outputIndex = (y * pixels + x) * 4;
        const roundedAlpha = Math.round(alphaTotal / sampleCount);
        if (roundedAlpha) {
          const centreX = Math.min(source.width - 1, Math.floor((x + 0.5) * cellWidth));
          const centreY = Math.min(source.height - 1, Math.floor((y + 0.5) * cellHeight));
          const centreIndex = (centreY * source.width + centreX) * 4;
          image.data[outputIndex] = sourceData[centreIndex];
          image.data[outputIndex + 1] = sourceData[centreIndex + 1];
          image.data[outputIndex + 2] = sourceData[centreIndex + 2];
          image.data[outputIndex + 3] = 255;
        }
      }
    }
    outputContext.putImageData(image, 0, 0);
    return output;
  }

  function resolutionForSize(size) {
    if (size >= 48) return 32;
    if (size >= 24) return 16;
    return 12;
  }

  function drawPixelizedEmoji(emoji, size) {
    const pixels = resolutionForSize(size);
    const scale = 8;
    const source = createCanvas(pixels * scale);
    const context = source.getContext('2d', { willReadFrequently: false });
    context.clearRect(0, 0, source.width, source.height);
    context.font = `${pixels * scale - 8}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'alphabetic';
    const metrics = context.measureText(emoji);
    // Centre actual glyph bounds, rather than relying on a platform's baseline.
    const baseline = source.height / 2 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
    context.fillText(emoji, source.width / 2, baseline);
    const output = downsampleWithMsaa(source, pixels);
    return posterizeAndOutline(output);
  }

  function emojiCanvas(emoji, size) {
    return drawPixelizedEmoji(emoji, size);
  }

  function replacement(emoji, size = 16) {
    const wrapper = document.createElement('span');
    wrapper.className = 'pixel-emoji';
    wrapper.setAttribute('role', 'img');
    wrapper.setAttribute('aria-label', emoji);
    wrapper.title = emoji;
    const source = document.createElement('span');
    source.className = 'pixel-emoji-source';
    source.setAttribute('aria-hidden', 'true');
    source.textContent = emoji;
    wrapper.append(emojiCanvas(emoji, size), source);
    return wrapper;
  }

  function replaceTextNode(node) {
    if (!enabled || !canReplace(node)) return;
    EMOJI_PATTERN.lastIndex = 0;
    if (!EMOJI_PATTERN.test(node.nodeValue)) return;
    EMOJI_PATTERN.lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let position = 0;
    let match;
    while ((match = EMOJI_PATTERN.exec(node.nodeValue))) {
      if (match.index > position) fragment.append(node.nodeValue.slice(position, match.index));
      const fontSize = parseFloat(getComputedStyle(node.parentElement).fontSize) || 16;
      fragment.append(replacement(match[0], fontSize));
      position = match.index + match[0].length;
    }
    if (position < node.nodeValue.length) fragment.append(node.nodeValue.slice(position));
    node.replaceWith(fragment);
  }

  function isOnlyEmoji(text) {
    const value = text.trim();
    EMOJI_PATTERN.lastIndex = 0;
    const match = EMOJI_PATTERN.exec(value);
    return Boolean(match && match[0] === value && EMOJI_PATTERN.lastIndex === value.length);
  }

  function replaceEmojiImage(image) {
    if (image.closest('.pixel-emoji') || !isOnlyEmoji(image.alt || image.getAttribute('aria-label') || '')) return;
    const emoji = (image.alt || image.getAttribute('aria-label')).trim();
    const imageSize = Math.max(image.clientWidth, image.clientHeight, image.width, image.height, 16);
    const wrapper = replacement(emoji, imageSize);
    wrapper.style.width = image.width ? `${image.width}px` : '';
    wrapper.style.height = image.height ? `${image.height}px` : '';
    image.replaceWith(wrapper);
  }

  function observeRoot(root) {
    if (observedRoots.has(root)) return;
    observedRoots.add(root);
    observer.observe(root, { childList: true, subtree: true, characterData: true });
  }

  function scan(root = document.body) {
    if (!enabled || !root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(replaceTextNode);
    if (root.querySelectorAll) {
      root.querySelectorAll('img').forEach(replaceEmojiImage);
      root.querySelectorAll('*').forEach((element) => {
        if (element.shadowRoot) {
          observeRoot(element.shadowRoot);
          scan(element.shadowRoot);
        }
      });
    }
  }

  function queueScan() {
    if (!enabled || scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scan();
    });
  }

  function reflectSelection() {
    const selected = document.querySelectorAll('.pixel-emoji-selected');
    selected.forEach((element) => element.classList.remove('pixel-emoji-selected'));
    const selection = document.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    document.querySelectorAll('.pixel-emoji-source').forEach((source) => {
      if (range.intersectsNode(source)) source.parentElement.classList.add('pixel-emoji-selected');
    });
  }

  function start() {
    if (observing || !document.documentElement) return;
    observing = true;
    observeRoot(document.documentElement);
    queueScan();
  }

  function stop() {
    observer.disconnect();
    observedRoots.clear();
    observing = false;
  }

  const observer = new MutationObserver((mutations) => {
    if (!enabled) return;
    for (const mutation of mutations) {
      if (mutation.type === 'characterData' || mutation.addedNodes.length) {
        queueScan();
        break;
      }
    }
  });

  // Standalone website version: no Chrome extension APIs required.
  // Include pixel-emoji.css and this script on every page.
  start();

  document.addEventListener('selectionchange', reflectSelection);
})();
