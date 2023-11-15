import { PageContainer } from '@ant-design/pro-components';
import styles from './index.less';
import DataTable from './components/DataTable';

const HomePage: React.FC = () => {
  return (
    <PageContainer ghost>
      <div className={styles.container}>
        <DataTable />
      </div>
    </PageContainer>
  );
};

export default HomePage;
