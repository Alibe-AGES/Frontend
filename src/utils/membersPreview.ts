/**
 * Joins the group members' names for a one-line preview. The current user is shown first, as "Eu",
 * and the others keep their order.
 */
export function buildMembersPreview(
  members: readonly { id: string; name: string }[],
  currentUserId: string | undefined
): string | undefined {
  if (members.length === 0) {
    return undefined;
  }

  const isCurrentUser = (member: { id: string }) =>
    currentUserId !== undefined && member.id === currentUserId;

  if (members.some(isCurrentUser)) {
    const others = members.filter((member) => !isCurrentUser(member)).map((member) => member.name);
    return ['Eu', ...others].join(', ');
  }

  return members.map((member) => member.name).join(', ');
}
