import { IMerchandiseItem, updateMaxCost } from '@/api';
import { InputNumber, Modal, Radio, message } from 'antd';
import { useEffect, useState } from 'react';
import { CustomMaxCost, MinMaxCost, NoLimitMaxCost } from '../constants';

export const UpdateMaxCost = ({
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
  const [radioStatus, setRadioStatus] = useState<number>();
  const [status, setStatus] = useState<'error' | ''>('');

  useEffect(() => {
    if (!item) return;
    if (item.maxCost < NoLimitMaxCost) {
      setRadioStatus(CustomMaxCost);
      setInputData(item.maxCost);
    } else {
      setRadioStatus(NoLimitMaxCost);
      setInputData(NoLimitMaxCost);
    }
  }, [item]);

  useEffect(() => {
    if (inputData < MinMaxCost || inputData > NoLimitMaxCost) setStatus('error');
    else setStatus('');
  }, [inputData]);

  return (
    <Modal
      title="修改日限额"
      open={show}
      width={500}
      onOk={async () => {
        console.log('========> submit ', item.goodsId, inputData);
        onCancel();
        const { code } = await updateMaxCost(
          item.goodsId,
          radioStatus === NoLimitMaxCost ? NoLimitMaxCost : (inputData as number),
        );
        if (code === 200) {
          message.success('修改成功');
          actionRef.current?.reload();
        } else {
          message.error('预算修改次数已达当日上限5次或网络错误');
        }
        await actionRef.current?.reload();
      }}
      onCancel={onCancel}
      okButtonProps={{
        disabled: status === 'error',
      }}
    >
      <Radio.Group
        onChange={(e) => {
          console.log('======> e.target.value', e.target.value);
          setRadioStatus(e.target.value);
        }}
        value={radioStatus}
      >
        <div>
          <Radio value={NoLimitMaxCost}>不限</Radio>
        </div>
        <div>
          <Radio value={CustomMaxCost}>自定义</Radio>
          <InputNumber
            status={status}
            disabled={radioStatus === NoLimitMaxCost}
            size="small"
            value={inputData}
            onChange={(v) => setInputData(v as number)}
          />
        </div>
      </Radio.Group>
      {status === 'error' && (
        <div style={{ color: 'red' }}>
          修改日限额只能介于{MinMaxCost}~{NoLimitMaxCost}
        </div>
      )}
    </Modal>
  );
};
