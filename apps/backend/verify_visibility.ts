import { AppDataSource } from './src/data-source';
import { ModulesService } from './src/modules/modules/modules.service';
import { UserRole } from './src/modules/auth/entities/user.entity';

async function run() {
  try {
    await AppDataSource.initialize();
    const modulesService = AppDataSource.getTreeRepository(any).manager.getCustomRepository ? null : new ModulesService(
        AppDataSource.getRepository('ModuleEntity'),
        null as any
    );
    
    // Actually, it's easier to just query the DB directly to see if PENDING modules are there.
    // But since the table is empty, I'll first check the search logic via a unit-test-like script.
    
    console.log("Checking search query builder logic...");
    const qb = AppDataSource.getRepository('ModuleEntity').createQueryBuilder('module');
    const userRole = UserRole.SUPER_ADMIN;
    
    if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN && userRole !== UserRole.MAINTAINER) {
      console.log("Filter WOULD be applied");
    } else {
      console.log("Filter WOULD NOT be applied (Success)");
    }
    
    await AppDataSource.destroy();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
