import { IMerchandiseItem, updateOptimizationBid, updateTargetRoi } from '@/api';
import { InputNumber, Modal, message } from 'antd';
import { useEffect, useState } from 'react';

export const UpdateROI = ({
  item,
  onCancel,
  actionRef,
  show,
}: {
  item: IMerchandiseItem | null;
  onCancel: () => void;
  actionRef: any;
  show: boolean;
}) => {
  const [inputData, setInputData] = useState<number>(0);

  useEffect(() => {
    if (!item) return;
    if (item.targetRoi) setInputData(item.targetRoi);
    if (item.optimizationBid) setInputData(item.optimizationBid);
  }, [item]);

  if (!item) return null;

  return (
    <Modal
      title={item.optimizationBid ? '修改成交出价' : '修改目标投产比'}
      open={show}
      width={500}
      onOk={async () => {
        onCancel();
        let code = 0;
        if (item.optimizationBid) {
          const res = await updateOptimizationBid(item.goodsId, inputData);
          code = res.code;
        }
        if (item.targetRoi) {
          const res = await updateTargetRoi(item.goodsId, inputData);
          code = res.code;
        }

        if (code === 200) {
          message.success('修改成功');
          actionRef.current?.reload();
        } else {
          message.error('修改失败');
        }
      }}
      onCancel={onCancel}
      okButtonProps={{
        disabled: status === 'error',
      }}
    >
      {Boolean(item.targetRoi) && (
        <>
          <div>
            目标投产比{' '}
            <InputNumber
              size="small"
              defaultValue={item.targetRoi}
              onChange={(v) => setInputData(v as number)}
            />
          </div>
          <div>投产比 = 搜索和场景流量对应交易额 ÷ 花费</div>
        </>
      )}

      {Boolean(item.optimizationBid) && (
        <>
          <div>
            成交出价{' '}
            <InputNumber
              size="small"
              defaultValue={item.optimizationBid}
              onChange={(v) => setInputData(v as number)}
            />{' '}
            元 成交
          </div>
          <div>成交出价 = 搜索和场景流量中，预期商品成交一单的广告花费</div>
        </>
      )}
    </Modal>
  );
};
