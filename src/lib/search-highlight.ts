export type SearchHighlightSegment = {
  highlighted: boolean;
  text: string;
};

// 拆分搜索高亮片段；text 为展示文案，keyword 为当前搜索词。
export function getSearchHighlightSegments(
  text: string,
  keyword: string,
): SearchHighlightSegment[] {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return [{ highlighted: false, text }];
  }

  const segments: SearchHighlightSegment[] = [];
  const lowerText = text.toLowerCase();
  let currentIndex = 0;
  let matchIndex = lowerText.indexOf(normalizedKeyword);

  while (matchIndex >= 0) {
    if (matchIndex > currentIndex) {
      segments.push({
        highlighted: false,
        text: text.slice(currentIndex, matchIndex),
      });
    }

    const matchEndIndex = matchIndex + normalizedKeyword.length;
    segments.push({
      highlighted: true,
      text: text.slice(matchIndex, matchEndIndex),
    });
    currentIndex = matchEndIndex;
    matchIndex = lowerText.indexOf(normalizedKeyword, currentIndex);
  }

  if (currentIndex < text.length) {
    segments.push({
      highlighted: false,
      text: text.slice(currentIndex),
    });
  }

  return segments.length > 0 ? segments : [{ highlighted: false, text }];
}
