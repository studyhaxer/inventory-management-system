"""use dialect-portable server_default for purchase and sale created_at

Revision ID: 434694fa30e4
Revises: 40147f8349cb
Create Date: 2026-07-15 05:46:09.558795

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '434694fa30e4'
down_revision: Union[str, Sequence[str], None] = '40147f8349cb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema.

    The original create_core_inventory_tables migration hardcoded
    server_default=sa.text('now()') for purchases.created_at and
    sales.created_at. That's raw Postgres SQL — it fails on SQLite,
    which has no now() function (SQLite's equivalent is
    CURRENT_TIMESTAMP). sa.func.now() is dialect-portable: SQLAlchemy
    compiles it to now() on Postgres and CURRENT_TIMESTAMP on SQLite,
    matching what the Purchase/Sale models already declare in Python.

    Using batch_alter_table so this also works on SQLite, which can't
    ALTER COLUMN in place — batch mode recreates the table instead.
    """
    with op.batch_alter_table("purchases") as batch_op:
        batch_op.alter_column(
            "created_at",
            server_default=sa.func.now(),
        )

    with op.batch_alter_table("sales") as batch_op:
        batch_op.alter_column(
            "created_at",
            server_default=sa.func.now(),
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("sales") as batch_op:
        batch_op.alter_column(
            "created_at",
            server_default=sa.text("now()"),
        )

    with op.batch_alter_table("purchases") as batch_op:
        batch_op.alter_column(
            "created_at",
            server_default=sa.text("now()"),
        )