import { useGetRolesQuery } from "../../../store/apiSlice";
import { useAuth } from "../../../context/AuthContext";
import { STAFF_ROLES } from "../../../helpers/auth";
import { RoleOption } from "../../../types/types";

export type { RoleOption };

// The roles endpoint returns either an array of roles or { data: roles }
const toRoleOptions = (response: unknown): RoleOption[] => {
  const list = Array.isArray(response)
    ? response
    : Array.isArray((response as any)?.data)
    ? (response as any).data
    : [];
  return list
    .filter((r: any) => r && typeof r === "object" && "id" in r && "name" in r)
    .map((r: any) => ({
      id: r.id,
      name: r.name,
      permissions: Array.isArray(r.permissions) ? r.permissions : [],
    }));
};

interface UseRoleOptionsArgs {
  // Only roles the current user may give to someone. A company Admin can only
  // assign staff roles; the API rejects anything else.
  assignableOnly?: boolean;
}

const useRoleOptions = ({ assignableOnly = false }: UseRoleOptionsArgs = {}) => {
  const { data, isLoading, isError } = useGetRolesQuery();
  const { isSuperAdmin } = useAuth();

  const allRoles = toRoleOptions(data);
  const roles =
    assignableOnly && !isSuperAdmin
      ? allRoles.filter((r) => STAFF_ROLES.has(r.name))
      : allRoles;

  return { roles, allRoles, isLoading, isError };
};

export default useRoleOptions;
