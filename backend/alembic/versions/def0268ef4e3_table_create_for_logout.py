"""table create for logout

Revision ID: def0268ef4e3
Revises: e39a9704d776
Create Date: 2025-12-31 19:19:41.066947

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'def0268ef4e3'
down_revision: Union[str, Sequence[str], None] = 'e39a9704d776'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
