import { useState } from "react";
import {
  useAssignRoleMutation,
  useRemoveRoleMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} from "../../../store/apiSlice";
import { formatRoleName } from "../../../helpers";
import {
  Permissions,
  STAFF_ROLES,
  getErrorMessage,
} from "../../../helpers/auth";
import { useAuth } from "../../../context/AuthContext";
import { AdminUser } from "../../../types/types";
import useRoleOptions from "./useRoleOptions";

// `role` is omitted when the user has no roles, so this can be empty
export const userRoleNames = (user: AdminUser): string[] =>
  user.roles?.length
    ? user.roles.map((r) => r.name)
    : user.role
    ? [user.role]
    : [];

// Role and status changes for an admin user, shared by the table and the profile page
const useAdminUserActions = () => {
  const { user: currentUser, can, isSuperAdmin } = useAuth();
  const { roles: assignableRoles, allRoles } = useRoleOptions({
    assignableOnly: true,
  });
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const [assignRole] = useAssignRoleMutation();
  const [removeRole] = useRemoveRoleMutation();
  const [activateUser] = useActivateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();

  // A company Admin can only manage staff users in their company, and never themselves
  const canManageUser = (user: AdminUser) =>
    can(Permissions.UsersManage) &&
    user.id !== currentUser?.uid &&
    (isSuperAdmin ||
      userRoleNames(user).every((name) => STAFF_ROLES.has(name)));

  // Replaces all of the user's roles with `newRoleId`. Returns true if the new role was assigned.
  const changeRole = async (user: AdminUser, newRoleId: string) => {
    const oldRoles = (
      user.roles?.length
        ? user.roles
        : allRoles.filter((r) => r.name === user.role)
    ).filter((r) => r.id !== newRoleId);

    setBusyUserId(user.id);
    try {
      // Assign first so the user is never left without a role
      await assignRole({ userId: user.id, roleId: newRoleId }).unwrap();
    } catch (error) {
      alert(getErrorMessage(error, "Failed to assign the new role"));
      setBusyUserId(null);
      return false;
    }
    for (const oldRole of oldRoles) {
      try {
        await removeRole({ userId: user.id, roleId: oldRole.id }).unwrap();
      } catch (error) {
        alert(
          `The new role was assigned, but the old role (${formatRoleName(
            oldRole.name
          )}) could not be removed: ${getErrorMessage(error, "unknown error")}`
        );
      }
    }
    setBusyUserId(null);
    return true;
  };

  // Activates or deactivates the user. Returns true if the status changed.
  const setActive = async (user: AdminUser, active: boolean) => {
    if (
      !active &&
      !window.confirm(
        `Deactivate ${user.fullName}? They will be signed out everywhere.`
      )
    ) {
      return false;
    }
    setBusyUserId(user.id);
    try {
      if (active) {
        await activateUser({ userId: user.id }).unwrap();
      } else {
        await deactivateUser({ userId: user.id }).unwrap();
      }
      return true;
    } catch (error) {
      alert(
        getErrorMessage(
          error,
          `Failed to ${active ? "activate" : "deactivate"} user`
        )
      );
      return false;
    } finally {
      setBusyUserId(null);
    }
  };

  return {
    assignableRoles,
    allRoles,
    busyUserId,
    canManageUser,
    changeRole,
    setActive,
  };
};

export default useAdminUserActions;
