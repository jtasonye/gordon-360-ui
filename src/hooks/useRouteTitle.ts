import { useEffect } from 'react';
import { useMatches } from 'react-router';

export default function useRouteTitle() {
  const matches = useMatches();

  useEffect(() => {
    const finalMatchWithTitle = matches.findLast(
      (m) =>
        m.handle &&
        typeof m.handle === 'object' &&
        'title' in m.handle &&
        typeof m.handle.title === 'function',
    );

    if (finalMatchWithTitle) {
      // @ts-ignore TypeScript doesn't know that we've already confirmed the existence of `match.handle.title` and that it's a function, in the `findLast` predicate above
      const title = finalMatchWithTitle?.handle?.title?.(finalMatchWithTitle?.data);

      if (title) {
        document.title = title;
      }
    }
  }, [matches]);
}
