// Reused for every comparison instead of being recreated implicitly by each
// localeCompare() call - this is the win for large arrays, since
// constructing collator state per comparison can be expensive
const collator = new Intl.Collator();

export const sortAlbums = <
  A extends { path: string; order?: number; resolved?: { order?: number } },
>(
  albums: A[],
): A[] => {
  const pathPartsByPath = new Map<string, string[]>();
  const pathOrderMap = new Map<string, number>();
  for (const album of albums) {
    pathPartsByPath.set(album.path, album.path.split('/'));

    const albumOrder = album.order ?? album.resolved?.order;
    if (albumOrder !== undefined) {
      pathOrderMap.set(album.path, albumOrder);
    }
  }

  return [...albums].sort((a1, a2) => {
    const a1PathParts = pathPartsByPath.get(a1.path)!;
    const a2PathParts = pathPartsByPath.get(a2.path)!;

    // different root paths
    if (a1PathParts[0] !== a2PathParts[0]) {
      const i1 = pathOrderMap.get(a1PathParts[0]) ?? -1;
      const i2 = pathOrderMap.get(a2PathParts[0]) ?? -1;
      return i2 - i1;
    }

    // the same root path
    // sub albums sorting
    const minPathParts = Math.min(a1PathParts.length, a2PathParts.length);
    let a1Prefix = a1PathParts[0];
    let a2Prefix = a2PathParts[0];
    for (let i = 1; i < minPathParts; i++) {
      a1Prefix += `/${a1PathParts[i]}`;
      a2Prefix += `/${a2PathParts[i]}`;
      if (a1PathParts[i] !== a2PathParts[i]) {
        // one is sub album of another
        if (a1PathParts[i] === undefined) return -1;
        if (a2PathParts[i] === undefined) return 1;

        // sub albums of one album
        const diffPath1Order = pathOrderMap.get(a1Prefix);
        const diffPath2Order = pathOrderMap.get(a2Prefix);
        if (diffPath1Order !== undefined || diffPath2Order !== undefined) {
          if (diffPath2Order === undefined) return -1;
          if (diffPath1Order === undefined) return 1;
          return diffPath1Order - diffPath2Order;
        }

        // alphabetical order otherwise
        return collator.compare(a1PathParts[i], a2PathParts[i]);
      }
    }

    if (a1PathParts.length !== a2PathParts.length) {
      return a1PathParts.length - a2PathParts.length;
    }

    return collator.compare(a1.path, a2.path);
  });
};

export const sortFiles = <F extends { filename: string }>(files: F[]): F[] =>
  [...files].sort((f1, f2) => collator.compare(f1.filename, f2.filename));
