import {
  IAllMerchandiseParams,
  IMerchandiseItem,
  MerchandiseType,
  getAllMerchandise,
  updateGoodsStatus,
} from '@/api';
import { DownOutlined, FormOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { LightFilter, ProTable } from '@ant-design/pro-components';
import { Button, Dropdown, MenuProps, Popover, Switch, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

import style from './style.less';
import { useRef, useState } from 'react';
import { UpdateMaxCost } from './UpdateMaxCost';
import { CreateTable } from './CreateTable';
import { UpdateROI } from './UpdateROI';
import { NoLimitMaxCost } from '../constants';
import DatePicker from './DatePicker';

type RangeValue = [Dayjs | null, Dayjs | null] | null;
const submitTimeFormat = 'YYYY-MM-DD HH:mm:ss';
const days7: RangeValue = [dayjs().subtract(8, 'day'), dayjs().subtract(1, 'day')];
const days30: RangeValue = [dayjs().subtract(31, 'day'), dayjs().subtract(1, 'day')];
const days90: RangeValue = [dayjs().subtract(91, 'day'), dayjs().subtract(1, 'day')];

const timeList = [
  { label: '7天', value: days7 },
  { label: '30天', value: days30 },
  { label: '90天', value: days90 },
];

export default () => {
  const actionRef = useRef<ActionType>();
  const [selectedItem, setSelectItem] = useState<IMerchandiseItem | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [searchString, setSearchString] = useState('');
  const [createShow, setCreateShow] = useState(false);
  const [showROIModal, setShowROIMdal] = useState(false);
  const [showCostMdal, setShowCostModal] = useState(false);
  const [tempDate, setTempDate] = useState<RangeValue>(days7);

  const columns: ProColumns<IMerchandiseItem>[] = [
    {
      title: '计划状态',
      dataIndex: 'adStatus',
      render: (_, item) => {
        return (
          <Switch
            checked={item.dataOperateStatus === 1}
            onChange={(v) => {
              const status = v ? 'ON' : 'OFF';
              updateGoodsStatus(item.goodsId + '', status).then(({ code }) => {
                if (code !== 200) return message.error('修改失败');

                message.success('修改成功');
                actionRef.current?.reload();
              });
            }}
          />
        );
      },
      fixed: 'left',
      width: 80,
    },
    {
      title: (
        <div>
          <Popover
            content={
              <div>
                <div>推广中</div>
                <div>推广商品在全站推广处于上线状态；</div>
                <div>手动暂停</div>
                <div>手动暂停推广，在全站推广处于下线状态；</div>
                <div>商品售罄</div>
                <div>推广商品库存为0，在全站推广处于下线状态；</div>
                <div>商品下架</div>
                <div>推广商品已从店铺下架，在全站推广处于下线状态；</div>
                <div>审核中</div>
                <div>系统审核中，请耐心等待；</div>
                <div>审核驳回</div>
                <div>推广商品命中违规被审核驳回，在全站推广处于下线状态；</div>
                <div>到达日限额</div>
                <div>推广达到日预算限额，在全站推广处于下线状态；</div>
                <div>余额不足</div>
                <div>账户余额不足，在全站推广处于下线状态；</div>
                <div>推广受限</div>
                <div style={{ width: '500px' }}>
                  使用推广服务的商品或店铺因违反拼多多店铺推广规则、滥发信息规则或其他平台规则，或因店铺（商品）服务质量不达标（品质退货率、介入率、纠纷率、客服回复率、物流服务率、店铺dsr、商品评分、用户评价等），会显示推广受限状态，请先优化店铺（商品）各项指标再进行推广；
                </div>
              </div>
            }
          >
            <QuestionCircleOutlined />
            推广状态
          </Popover>
        </div>
      ),
      dataIndex: 'dataOperateStatus',
      fixed: 'left',
      width: 90,
      render: (_, item) => {
        if (item.dataOperateStatus !== item.adStatus) return '-';
        if (item.dataOperateStatus === 1) return '推广中';
        if (item.dataOperateStatus === 2) return '已暂停';
        return '-';
      },
      // align: 'right',
      // sorter: (a, b) => a.containers - b.containers,
    },
    {
      title: '计划名称',
      dataIndex: 'creator',
      fixed: 'left',
      width: 280,
      render: (_, item) => {
        return (
          <div className={style.merchandise}>
            <img src={item.thumbUrl} style={{ width: '40px', height: '40px' }} />
            <div className={style.right} style={{ marginLeft: '8px' }}>
              <div>{item.adName}</div>

              <div className={style.bottom}>
                <span>ID:{item.goodsId}</span>
                <span>拼单价:{item.minGroupPrice}元</span>
              </div>
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
          >
            <QuestionCircleOutlined />
            目标投产比/成交出价
          </Popover>
        </div>
      ),
      width: 160,
      render: (_, item) => {
        const openit = () => {
          setSelectItem(item);
          setShowROIMdal(true);
        };
        if (item.optimizationBid)
          return (
            <div>
              {`成交出价：${item.optimizationBid}`}
              <FormOutlined onClick={openit} />
            </div>
          );

        if (item.targetRoi)
          return (
            <div>
              {' '}
              {`目标投产比：${item.targetRoi}`} <FormOutlined onClick={openit} />
            </div>
          );
        return '-';
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
          >
            <QuestionCircleOutlined />
            消耗日限额
          </Popover>
        </div>
      ),
      dataIndex: 'maxCost',
      width: 100,
      render: (_, item) => (
        <div>
          {`${item.maxCost < NoLimitMaxCost ? item.maxCost : '不限'}`}
          <FormOutlined
            onClick={() => {
              setSelectItem(item);
              setShowCostModal(true);
            }}
          />
        </div>
      ),
    },
    {
      title: '曝光量',
      dataIndex: 'EXPOSURE',
      width: 100,
      sorter: true,
      render: (_, i) => i.reportInfo.impression,
    },
    {
      title: '点击量',
      dataIndex: 'CLICK',
      width: 100,
      sorter: true,
      render: (_, i) => i.reportInfo.click,
    },
    {
      title: '点击率',
      dataIndex: 'CLICK_RATIO',
      width: 100,
      sorter: true,
      render: (_, i) => i.reportInfo.ctr + '%',
    },
    {
      title: '转化率',
      dataIndex: 'cvr',
      width: 100,
      render: (_, i) => i.reportInfo.cvr + '%',
    },
    {
      title: 'CPC',
      dataIndex: 'CPC',
      width: 100,
      sorter: true,
      render: (_, i) => '¥' + i.reportInfo.cpc,
    },
    {
      title: '消耗',
      dataIndex: 'COST',
      width: 100,
      sorter: true,
      render: (_, i) => i.reportInfo.spend,
    },
    {
      title: '订单数',
      dataIndex: 'ORDER_COUNT',
      width: 100,
      sorter: true,
      render: (_, i) => i.reportInfo.orderNum,
    },
    {
      title: '交易额',
      dataIndex: 'GMV',
      width: 100,
      sorter: true,
      render: (_, i) => i.reportInfo.gmv,
    },
    {
      title: 'ROI',
      dataIndex: 'ROI',
      width: 100,
      sorter: true,
      render: (_, i) => i.reportInfo.roi,
    },
    {
      title: '全站费比',
      width: 100,
      render: (_, i) => i.reportInfo.globalTakeRate + '%',
    },
    {
      title: '平均成交花费',
      width: 100,
      render: (_, i) => '¥' + i.reportInfo.avgSpendAmount,
    },
    {
      title: '直接成交每笔成交金额',
      width: 140,
      render: (_, i) => i.reportInfo.avgDirectPayAmount + '元',
    },
    {
      title: '间接成交每笔成交金额',
      width: 140,
      render: (_, i) => i.reportInfo.avgIndirectPayAmount + '元',
    },
    {
      title: '直接成交交易额',
      width: 110,
      render: (_, i) => i.reportInfo.directGmv + '元',
    },
    {
      title: '间接成交交易额',
      width: 110,
      render: (_, i) => i.reportInfo.indirectGmv + '元',
    },
    {
      title: '直接成交笔数',
      dataIndex: 'ROI',
      width: 100,
      render: (_, i) => i.reportInfo.directOrderNum,
    },
    {
      title: '间接成交笔数',
      width: 100,
      render: (_, i) => i.reportInfo.indirectOrderNum,
    },
    {
      title: '成团客单价',
      width: 100,
      render: (_, i) => i.reportInfo.avgPayAmount + '元',
    },
    {
      title: '千次展现成本',
      width: 100,
      render: (_, i) => '¥' + i.reportInfo.cpm,
    },
  ];

  const menuItems: MenuProps['items'] = [
    {
      key: 'ON',
      label: '批量启动',
    },
    {
      key: 'OFF',
      label: '批量暂停',
    },
  ];

  return (
    <>
      <CreateTable
        isOpen={createShow}
        onCancel={() => setCreateShow(false)}
        actionRef={actionRef}
      />
      <UpdateROI
        show={showROIModal}
        onCancel={setShowROIMdal.bind(null, false)}
        item={selectedItem}
        actionRef={actionRef}
      />
      <UpdateMaxCost
        show={showCostMdal}
        actionRef={actionRef}
        item={selectedItem}
        onCancel={setShowCostModal.bind(null, false)}
      />
      <ProTable<IMerchandiseItem>
        columns={columns}
        actionRef={actionRef}
        rowSelection={{
          onChange: async (keys, rows) => {
            setSelectedRowKeys(rows.map(({ goodsId }) => goodsId));
          },
          selectedRowKeys,
        }}
        request={(params, sorter, filter) => {
          const _p: IAllMerchandiseParams = {};

          // 表单搜索项会从 params 传入，传递给后端接口。
          console.log(params, sorter, filter);
          if (searchString) _p.goodsIds = searchString;
          _p.pageSize = params.pageSize;
          _p.pageNumber = params.current;
          const s = Object.keys(sorter)[0];
          if (s) {
            const sort = sorter[s] === 'ascend' ? 'ASC' : 'DESC';
            _p.sort = sort;
            _p.orderBy = s as MerchandiseType;
          }
          if (tempDate && tempDate[0] && tempDate[1]) {
            _p.startDate = tempDate[0].hour(0).minute(0).second(0).format(submitTimeFormat);
            _p.endDate = tempDate[1].hour(23).minute(59).second(59).format(submitTimeFormat);
          }

          return getAllMerchandise(_p).then((data) => {
            return { data: data?.list || [], total: data?.total || 0, success: true };
          });
        }}
        options={false}
        toolbar={{
          search: {
            onSearch: (value: string) => {
              setSearchString(value);
              actionRef.current?.reload();
            },
            placeholder: '请输入宝贝id',
          },
          filter: (
            <LightFilter>
              <DatePicker.RangePicker
                renderExtraFooter={() => (
                  <>
                    {timeList.map((item, i) => (
                      <Button
                        key={i}
                        type="primary"
                        size="small"
                        style={{ marginRight: '16px' }}
                        onClick={() => {
                          setTempDate(item.value);
                          actionRef.current?.reload();
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </>
                )}
                onCalendarChange={(v) => {
                  setTempDate(v as any);
                }}
                onChange={() => {
                  actionRef.current?.reload();
                }}
                value={tempDate}
                disabledDate={(current) => {
                  if (current.isAfter(dayjs())) return true;
                  if (!tempDate) return false;
                  const tooLate = tempDate[0] && current.diff(tempDate[0], 'days') >= 90;
                  const tooEarly = tempDate[1] && tempDate[1].diff(current, 'days') >= 90;

                  return !!tooEarly || !!tooLate;
                }}
              />
            </LightFilter>
          ),
          actions: [
            <Button
              key="primary"
              type="primary"
              size="small"
              onClick={() => {
                setCreateShow(true);
              }}
            >
              新建全站计划
            </Button>,
          ],
        }}
        rowKey="goodsId"
        scroll={{ x: 3400 }}
        search={false}
      />

      <Dropdown
        disabled={selectedRowKeys.length === 0}
        menu={{
          items: menuItems,
          onClick: ({ key }) => {
            updateGoodsStatus(selectedRowKeys.join(','), key as 'ON' | 'OFF').then((res) => {
              if (res.code === 200) {
                setSelectedRowKeys([]);
                message.success(`${key === 'ON' ? '重启' : '关闭'} 成功`);
                actionRef.current?.reload();
              }
            });
          },
        }}
      >
        <Button type="primary" size="small" disabled={selectedRowKeys.length === 0}>
          批量操作
          <DownOutlined />
        </Button>
      </Dropdown>
    </>
  );
};
