import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserTable1712580000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create enums (with IF NOT EXISTS logic handled manually since PG doesn't support it for CREATE TYPE)
    const checkType = async (name: string) => {
      const res = await queryRunner.query(`SELECT 1 FROM pg_type WHERE typname = '${name}'`);
      return res.length > 0;
    };

    if (!(await checkType('user_status_enum'))) {
      await queryRunner.query(`CREATE TYPE "user_status_enum" AS ENUM ('active', 'inactive', 'suspended')`);
    }

    if (!(await checkType('user_role_enum'))) {
      await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM ('super_admin', 'admin', 'maintainer', 'reviewer', 'developer', 'viewer')`);
    }

    // 2. Update existing columns
    const columns = await queryRunner.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'user'`);
    const columnNames = columns.map((c: any) => c.column_name);

    if (columnNames.includes('name') && !columnNames.includes('fullName')) {
      await queryRunner.query('ALTER TABLE "user" RENAME COLUMN "name" TO "fullName"');
    }
    if (columnNames.includes('password') && !columnNames.includes('passwordHash')) {
      await queryRunner.query('ALTER TABLE "user" RENAME COLUMN "password" TO "passwordHash"');
    }
    if (columnNames.includes('roles')) {
      await queryRunner.query('ALTER TABLE "user" DROP COLUMN "roles"');
    }

    // 3. Add new columns
    const addColumn = async (name: string, definition: string) => {
      if (!columnNames.includes(name)) {
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN "${name}" ${definition}`);
      }
    };

    await addColumn('status', `"user_status_enum" NOT NULL DEFAULT 'active'`);
    await addColumn('role', `"user_role_enum" NOT NULL DEFAULT 'developer'`);
    await addColumn('employeeId', 'character varying');
    await addColumn('department', 'character varying');
    await addColumn('jobTitle', 'character varying');
    await addColumn('contactNumber', 'character varying');
    await addColumn('profilePhotoUrl', 'character varying');
    await addColumn('lastLogin', 'TIMESTAMP');
    await addColumn('createdBy', 'uuid');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Remove new columns
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "createdBy"');
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "lastLogin"');
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "profilePhotoUrl"');
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "contactNumber"');
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "jobTitle"');
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "department"');
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "employeeId"');
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "role"');
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "status"');

    // 2. Restore old columns
    await queryRunner.query('ALTER TABLE "user" ADD COLUMN "roles" text DEFAULT \'developer\'');
    await queryRunner.query('ALTER TABLE "user" RENAME COLUMN "passwordHash" TO "password"');
    await queryRunner.query('ALTER TABLE "user" RENAME COLUMN "fullName" TO "name"');

    // 3. Drop enums
    await queryRunner.query('DROP TYPE "user_role_enum"');
    await queryRunner.query('DROP TYPE "user_status_enum"');
  }
}
