interface Props {
  resolvedAccesses?: string[];
  accesses?: string[];
  defaultAccesses?: string[];
}

export const AdminAccesses = ({
  resolvedAccesses,
  accesses,
  defaultAccesses,
}: Props) => {
  return (
    <>
      {(resolvedAccesses?.includes('public') ||
        accesses?.includes('public') ||
        defaultAccesses?.includes('public')) &&
        '🔴 '}

      {resolvedAccesses && resolvedAccesses.join(',')}

      {` (${accesses ? 'direct' : 'inherited'})`}

      {defaultAccesses && `, default: ${defaultAccesses.join(',')}`}
    </>
  );
};
