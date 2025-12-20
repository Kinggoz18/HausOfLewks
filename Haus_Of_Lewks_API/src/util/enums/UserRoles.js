/**
 * @readonly
 * @enum
 */
const UserRoles = Object.freeze({
  owner: 'Owner',
  employee: 'Employee',
  developer: 'Developer',
  customer: 'Customer'
});

const UserRolesEnum = Object.values(UserRoles);
export default UserRolesEnum;
