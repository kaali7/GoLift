"""fix duplicate index issue

Revision ID: a1c07cff80a4
Revises: 74edc0aa8282
Create Date: 2026-01-10 20:10:26.512922

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1c07cff80a4'
down_revision: Union[str, Sequence[str], None] = '74edc0aa8282'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("DROP INDEX IF EXISTS idx_user_created_at;")
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
