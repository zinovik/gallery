import type { AlbumInterface } from '../types';

export const sortAlbums = (albums: AlbumInterface[]): AlbumInterface[] => {
  const topLevelPathsOriginalOrdered = albums
    .filter((album) => album.path.split('/').length === 1)
    .map((album) => album.path);

  const pathOrderMap: Record<string, number> = {};
  albums.forEach((album) => {
    if (album.order !== undefined) {
      pathOrderMap[album.path] = album.order;
    }
  });

  return [...albums].sort((a1, a2) => {
    const a1PathParts = a1.path.split('/');
    const a2PathParts = a2.path.split('/');

    // different root paths
    if (a1PathParts[0] !== a2PathParts[0])
      return (
        topLevelPathsOriginalOrdered.indexOf(a1PathParts[0]) -
        topLevelPathsOriginalOrdered.indexOf(a2PathParts[0])
      );

    // the same root path

    // sub albums sorting
    const minPathParts = Math.min(a1PathParts.length, a2PathParts.length);

    for (let i = 1; i < minPathParts; i++) {
      if (a1PathParts[i] !== a2PathParts[i]) {
        // one is sub album of another
        if (a1PathParts[i] === undefined) return -1;
        if (a2PathParts[i] === undefined) return 1;

        // sub albums of one album
        const diffPath1Order =
          pathOrderMap[a1PathParts.slice(0, i + 1).join('/')];
        const diffPath2Order =
          pathOrderMap[a2PathParts.slice(0, i + 1).join('/')];

        if (diffPath1Order || diffPath2Order) {
          if (diffPath2Order === undefined) return -1;
          if (diffPath1Order === undefined) return 1;

          return diffPath1Order - diffPath2Order;
        }

        // alphabetical order otherwise
        return a1PathParts[i].localeCompare(a2PathParts[i]);
      }
    }

    return 0;
  });
};
