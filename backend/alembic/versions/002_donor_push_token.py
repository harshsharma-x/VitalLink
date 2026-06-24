"""Add push_token and donation_count to donors

Revision ID: 002
Revises: 001
Create Date: 2026-06-24

"""
from alembic import op
import sqlalchemy as sa

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('donors', sa.Column('push_token', sa.String(255), nullable=True))
    op.add_column('donors', sa.Column('donation_count', sa.Integer(), nullable=True, server_default='0'))


def downgrade() -> None:
    op.drop_column('donors', 'push_token')
    op.drop_column('donors', 'donation_count')
