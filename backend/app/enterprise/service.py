from datetime import datetime
from .models import (
    ORGANIZATIONS_COLLECTION,
    ORGANIZATION_MEMBERSHIPS_COLLECTION,
)
from .schemas import OrganizationDocument, OrganizationMembership


class EnterpriseService:
    def __init__(self, db):
        self.db = db

    async def create_organization(self, payload: OrganizationDocument):
        data = payload.model_dump(by_alias=True, exclude_none=True)
        if not data.get("created_at"):
            data["created_at"] = datetime.utcnow()

        result = await self.db[ORGANIZATIONS_COLLECTION].insert_one(data)
        return str(result.inserted_id)

    async def create_membership(self, payload: OrganizationMembership):
        data = payload.model_dump(by_alias=True, exclude_none=True)
        if not data.get("organization_joined_at"):
            data["organization_joined_at"] = datetime.utcnow()

        result = await self.db[ORGANIZATION_MEMBERSHIPS_COLLECTION].insert_one(data)
        return str(result.inserted_id)

    async def get_organization(self, organization_id: str):
        return await self.db[ORGANIZATIONS_COLLECTION].find_one({"_id": organization_id})

    async def get_membership_by_user(self, user_id: str):
        return await self.db[ORGANIZATION_MEMBERSHIPS_COLLECTION].find_one({"user_id": user_id})