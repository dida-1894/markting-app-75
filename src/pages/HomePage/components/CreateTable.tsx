import { IUndeclaredItem, createMerchandise, getSuggests, getUndeclared } from '@/api';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, InputNumber, Modal, Popover, Radio, Table, message } from 'antd';
import { useRef, useState } from 'react';
import style from './style.less';
import { ColumnsType } from 'antd/es/table';
import { BatchOperate } from './BatchOperate';
import { NoLimitMaxCost } from '../constants';
import { QuestionCircleOutlined } from '@ant-design/icons';

interface IProps {
  isOpen: boolean;
  onCancel: () => void;
  actionRef: any;
}

const isROI = 'TARGET_ROI';
const isBid = 'OPTIMIZATION_BID';

const isNoLimit = 0;
const isCumstom = 1;

export const CreateTable = (props: IProps) => {
  const [selectedRows, setSelectedRows] = useState<IUndeclaredItem[]>([]);
  const [showBatch, setShowBatch] = useState(false);
  const [searchString, setSearchString] = useState('');
  const actionRef = useRef<ActionType>();
  const [pageNumber, setPageNumber] = useState(1);
  const [isEnd, setIsEnd] = useState(false);
  const scrollRef = useRef(document.createElement('div'));
  const [dataList, setDateList] = useState<IUndeclaredItem[]>([]);

  const onScrollCapture = () => {
    // scrollTop会有小数点导致等式不成立，解决方案：四舍五入
    if (
      Math.round(scrollRef.current?.scrollTop) + scrollRef.current?.clientHeight ===
      scrollRef.current?.scrollHeight
    ) {
      if (isEnd) return;

      actionRef.current?.reload();
    }
  };

  const undeclaredColumns: ProColumns<IUndeclaredItem>[] = [
    {
      title: '宝贝信息',
      width: 240,
      render: (_, item) => {
        return (
          <div className={style.merchandise}>
            <img src={item.thumbUrl} style={{ width: '40px', height: '40px' }} />
            <div className={style.right} style={{ marginLeft: '8px' }}>
              <div>{item.goodsName}</div>

              <div className={style.bottom}>ID:{item.goodsId}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: '总数量',
      width: 100,
      dataIndex: 'goodsQuantity',
    },
    {
      title: '状态',
      width: 80,
      dataIndex: 'isOnsale',
      valueEnum: {
        0: { text: '下架' },
        1: { text: '上架中' },
      },
    },
  ];
  const SelectedTableColumns: ColumnsType<IUndeclaredItem> = [
    {
      title: '宝贝信息',
      width: 240,
      render: (_, item) => {
        return (
          <div className={style.merchandise}>
            <img src={item.thumbUrl} style={{ width: '40px', height: '40px' }} />
            <div className={style.right} style={{ marginLeft: '8px' }}>
              <div>{item.goodsName}</div>

              <div className={style.bottom}>ID:{item.goodsId}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: (
        <div>
          <Popover
            content={
              <div>
                <div>成交出价：搜索和场景流量中，预期商品成交一单的广告花费</div>
                <div>目标投产比：投产比 = 搜索和场景流量对应交易额 ÷ 花费</div>
              </div>
            }
            title="Title"
          >
            <QuestionCircleOutlined />
            目标投产比/成交出价
          </Popover>
        </div>
      ),
      width: 220,
      render: (_, item) => {
        return (
          <>
            <Radio.Group
              onChange={(e) => {
                const newList = selectedRows.slice(0);
                const theItem = newList.find((_i) => _i.goodsId === item.goodsId);
                if (!theItem) return;
                theItem.roiStatus = e.target.value;
                setSelectedRows(newList);
              }}
              value={item.roiStatus}
            >
              <div>
                <Radio value={isROI}>投产比</Radio>
                <InputNumber
                  size="small"
                  style={{ width: '80px', borderBottom: '1px solid #999', borderRadius: 0 }}
                  bordered={false}
                  controls={false}
                  value={item.targetRoi}
                  onChange={(v) => {
                    const newList = selectedRows.slice(0);
                    const theItem = newList.find((_i) => _i.goodsId === item.goodsId);
                    if (!theItem) return;
                    theItem.targetRoi = Number(v);
                    setSelectedRows(newList);
                  }}
                />
              </div>
              <div style={{ display: 'flex' }}>
                <Radio value={isBid}>
                  成交
                  <InputNumber
                    size="small"
                    style={{ width: '50px', borderBottom: '1px solid #999', borderRadius: 0 }}
                    controls={false}
                    bordered={false}
                    value={item.optimizationBid}
                    onChange={(v) => {
                      const newList = selectedRows.slice(0);
                      const theItem = newList.find((_i) => _i.goodsId === item.goodsId);
                      if (!theItem) return;
                      theItem.optimizationBid = Number(v);
                      setSelectedRows(newList);
                    }}
                  />
                  元可成交
                </Radio>
                <div></div>
              </div>
            </Radio.Group>
          </>
        );
      },
    },
    {
      title: (
        <div>
          <Popover
            content={
              <div>
                <div>
                  消耗日限额支持小于100，平台将在计划达到消耗日限额时自动暂停计划，次日开启计划
                </div>
                <div>预算日限额每天最多可修改5次，请勿频繁修改</div>
              </div>
            }
            title="Title"
          >
            <QuestionCircleOutlined />
            日限额
          </Popover>
        </div>
      ),
      width: 180,
      render: (_, item) => {
        return (
          <>
            <Radio.Group
              onChange={(e) => {
                const newList = selectedRows.slice(0);
                const theItem = newList.find((_i) => _i.goodsId === item.goodsId);
                if (!theItem) return;
                theItem.maxCostStatus = e.target.value;
                setSelectedRows(newList);
              }}
              value={item.maxCostStatus}
            >
              <div>
                <Radio value={isNoLimit}>不限</Radio>
              </div>
              <div>
                <Radio value={isCumstom}>自定义</Radio>
                <InputNumber
                  style={{ width: '50px', borderBottom: '1px solid #999', borderRadius: 0 }}
                  bordered={false}
                  controls={false}
                  size="small"
                  value={item.maxCost}
                  onChange={(v) => {
                    const newList = selectedRows.slice(0);
                    const theItem = newList.find((_i) => _i.goodsId === item.goodsId);
                    if (!theItem) return;
                    theItem.maxCost = Number(v);
                    setSelectedRows(newList);
                  }}
                />
              </div>
            </Radio.Group>
          </>
        );
      },
    },
  ];
  return (
    <Modal
      open={props.isOpen}
      title="添加推广商品"
      width={1200}
      onCancel={() => {
        setSelectedRows([]);
        props.onCancel();
      }}
      onOk={() => {
        createMerchandise({
          requests: selectedRows.map((item) => {
            const { roiStatus, targetRoi, optimizationBid, maxCost, goodsId } = item;
            let i = {};
            if (roiStatus === isROI) i = { targetRoi };
            else i = { optimizationBid };
            return { ...i, maxCost, goodsId };
          }),
        }).then(({ code, data }) => {
          if (code !== 200) return message.error('接口调用失败');

          const faileArr = data.reduce<number[]>((res, cur) => {
            if (!cur.success) res.push(cur.goodsId);
            return res;
          }, []);

          if (faileArr.length === 0) message.success('创建成功');
          else message.error(`${faileArr.join(',')}创建失败了`);
          props.onCancel();
          props.actionRef.current?.reload();
          setSelectedRows([]);
          setSearchString('');
        });
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }} className={style.custom}>
        <div style={{ width: '500px' }}>
          <div style={{ fontWeight: 500 }}>未投放全站推广宝贝列表</div>
          <div
            style={{ height: '400px', width: '500px', overflowY: 'scroll', position: 'relative' }}
            ref={scrollRef}
            onScrollCapture={onScrollCapture}
          >
            <ProTable<IUndeclaredItem>
              rowKey="goodsId"
              actionRef={actionRef}
              pagination={false}
              options={false}
              rowSelection={{
                onChange: async (keys, rows) => {
                  const selectedObject = selectedRows.reduce((res, cur) => {
                    res[cur.goodsId] = cur;
                    return res;
                  }, {} as { [k: number | string]: IUndeclaredItem });
                  const rowsObject = rows.reduce((res, cur) => {
                    res[cur.goodsId] = cur;
                    return res;
                  }, {} as { [k: number | string]: IUndeclaredItem });
                  try {
                    const { data } = await getSuggests(
                      rows.map(({ goodsId }) => goodsId).join(','),
                    );
                    data.map((i) => {
                      if (selectedObject[i.goodsId]) return selectedObject[i.goodsId];
                      const item = rowsObject[i.goodsId];
                      item.roiStatus = i.defaultBidType;
                      item.optimizationBid = i.suggestOptimizationBid;
                      item.targetRoi = i.suggestTargetRoi;
                      return i;
                    });
                  } catch {}
                  const v = Object.keys({ ...rowsObject }).map((key) => {
                    // 修改过的选中项目， 再点全选时保留原来的修改值
                    if (selectedObject[key]) return selectedObject[key];
                    return rowsObject[key];
                  });
                  setSelectedRows(v);
                },
                selectedRowKeys: selectedRows.map(({ goodsId }) => goodsId),
              }}
              columns={undeclaredColumns}
              search={false}
              toolbar={{
                search: {
                  onSearch: (value: string) => {
                    setSearchString(value);
                    actionRef.current?.reload();
                  },
                  placeholder: '请输入宝贝id',
                },
              }}
              request={() => {
                let goodsId;
                if (searchString) goodsId = searchString;
                const p = {
                  pageSize: 20,
                  pageNumber,
                  goodsId,
                };
                return getUndeclared(p).then((data) => {
                  const _cur = data?.pageNumber || 1;
                  if (_cur * 20 > Number(data?.total)) setIsEnd(true);
                  // if (data?.list.length === 0) setIsEnd(true)
                  setPageNumber((data?.pageNumber || pageNumber) + 1);
                  const list = data?.list || [];
                  setDateList([...dataList, ...list]);
                  return { data: [...dataList, ...list], total: data?.total || 0, success: true };
                });
              }}
            />
            {isEnd && <div style={{ textAlign: 'center' }}>到底了</div>}
          </div>
        </div>

        <div style={{ width: '650px' }}>
          <div style={{ fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
            待投放全站推广宝贝列表({selectedRows.length})
            <Button
              size="small"
              type="primary"
              disabled={selectedRows.length === 0}
              onClick={setShowBatch.bind(null, true)}
            >
              批量设置
            </Button>
          </div>

          <BatchOperate
            show={showBatch}
            onClose={() => setShowBatch(false)}
            onOk={(form) => {
              if (form.maxCost) {
                if (form.maxCost < NoLimitMaxCost) form.maxCostStatus = isCumstom;
                else {
                  form.maxCostStatus = isNoLimit;
                  form.maxCost = NoLimitMaxCost;
                }
              }
              setSelectedRows((pre) => pre.map((i) => ({ ...i, ...form })));
            }}
          />
          <Table<IUndeclaredItem>
            rowKey="goodsId"
            columns={SelectedTableColumns}
            dataSource={selectedRows}
            pagination={false}
            scroll={{
              y: 400,
            }}
          />
        </div>
      </div>
    </Modal>
  );
};
