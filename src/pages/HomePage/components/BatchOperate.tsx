import { Button, Checkbox, InputNumber } from 'antd';
import { useState } from 'react';

interface IForm {
  targetRoi?: number;
  optimizationBid?: number;
  maxCost?: number;
  maxCostStatus?: number;
}

export const BatchOperate = ({
  show,
  onOk,
  onClose,
}: {
  show: boolean;
  onOk: (v: IForm) => void;
  onClose: () => void;
}) => {
  const [checkList, setCheckList] = useState<string[]>([]);
  const [form, setForm] = useState<IForm>({});
  if (!show) return null;

  return (
    <div style={{ padding: '8px', border: '1px soild #999', margin: '8px 0', width: '640px' }}>
      <Checkbox.Group onChange={(v: string[]) => setCheckList(v)}>
        <div style={{ width: '100%' }}>
          <Checkbox value="targetRoi">目标投产比</Checkbox>
          <InputNumber
            size="small"
            style={{ width: '80px', borderBottom: '1px solid #999', borderRadius: 0 }}
            bordered={false}
            controls={false}
            placeholder="0.1-100"
            value={form.targetRoi}
            onChange={(targetRoi) => {
              if (!targetRoi) return;
              setForm({ ...form, targetRoi });
            }}
          />
        </div>

        <div style={{ marginTop: '16px' }}>
          <Checkbox value="optimizationBid">
            成交出价-固定出价为
            <InputNumber
              size="small"
              style={{ width: '80px', borderBottom: '1px solid #999', borderRadius: 0 }}
              bordered={false}
              controls={false}
              value={form.optimizationBid}
              onChange={(optimizationBid) => {
                if (!optimizationBid) return;
                setForm({ ...form, optimizationBid });
              }}
            />
            元时，系统最低出价超过时不添加
          </Checkbox>
        </div>

        <div style={{ marginTop: '16px' }}>
          <Checkbox value="maxCost">
            成交出价-官方推荐出价，最高不超过
            <InputNumber
              size="small"
              style={{ width: '80px', borderBottom: '1px solid #999', borderRadius: 0 }}
              bordered={false}
              controls={false}
              value={form.maxCost}
              onChange={(maxCost) => {
                if (!maxCost) return;
                setForm({ ...form, maxCost });
              }}
            />
            元时，系统推荐出价超过时不添加
          </Checkbox>
        </div>
      </Checkbox.Group>

      <div style={{ textAlign: 'right' }}>
        <Button size="small" style={{ marginRight: '16px' }} onClick={onClose}>
          收起设置
        </Button>
        <Button
          type="primary"
          size="small"
          disabled={checkList.length === 0}
          onClick={() => {
            const v = {};
            checkList.forEach((key) => {
              v[key] = form[key];
            });
            onOk(v);
          }}
        >
          确认设置
        </Button>
      </div>
    </div>
  );
};
