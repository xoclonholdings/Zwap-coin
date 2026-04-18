from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class OrganizationSettings(BaseModel):
    allow_team_challenges: bool = True
    allow_family_mode: bool = False
    allow_reward_redemptions: bool = True
    allow_badges: bool = True


class OrganizationDocument(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    organization_name: str
    organization_type: str
    organization_status: str = "active"
    organization_admin_ids: List[str] = []
    sponsor_ids: List[str] = []
    member_count: int = 0
    created_at: Optional[datetime] = None
    settings: OrganizationSettings = Field(default_factory=OrganizationSettings)


class OrganizationMembership(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    organization_id: str
    organization_name: Optional[str] = None
    department_name: Optional[str] = None
    team_name: Optional[str] = None
    manager_id: Optional[str] = None
    member_role: str = "member"
    employee_status: str = "active"
    family_group_id: Optional[str] = None
    organization_joined_at: Optional[datetime] = None


class EnterpriseUserFields(BaseModel):
    organization_id: Optional[str] = None
    organization_name: Optional[str] = None
    organization_type: Optional[str] = None
    department_name: Optional[str] = None
    team_name: Optional[str] = None
    manager_id: Optional[str] = None
    member_role: Optional[str] = None
    employee_status: Optional[str] = None
    family_group_id: Optional[str] = None
    organization_joined_at: Optional[datetime] = None