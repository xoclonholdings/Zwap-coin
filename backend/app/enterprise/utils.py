from .constants import (
    ORGANIZATION_TYPES,
    MEMBER_ROLES,
    EMPLOYEE_STATUSES,
)


def is_valid_organization_type(value: str) -> bool:
    return value in ORGANIZATION_TYPES


def is_valid_member_role(value: str) -> bool:
    return value in MEMBER_ROLES


def is_valid_employee_status(value: str) -> bool:
    return value in EMPLOYEE_STATUSES