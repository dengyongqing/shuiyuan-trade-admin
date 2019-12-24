  import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Badge,
  Divider,
  Steps,
  Radio,
  Table,
  Upload,
  Popconfirm,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { routerRedux } from "dva/router";
import styles from './OrderList.less';

const { Dragger } = Upload;
const FormItem = Form.Item;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;
const { RangePicker } = DatePicker;
const get = require('lodash/get')
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['default', 'processing', 'success', 'error'];
const status = ['关闭', '运行中', '已上线', '异常'];

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};

const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleEdit, handleModalVisible, currentOrder } = props;

  const exportProps = {
    name: 'file',
    multiple: true,
    action: '/wlapi/order/import',
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} 上传成功`);
        const { dispatch } = this.props;
        dispatch({
          type: 'order/fetch',
        });
      } else if (status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      if (fieldsValue.id) {
        handleEdit(fieldsValue);
      } else {
        handleAdd(fieldsValue);
      }
    });
  };
  
  return (
    <Modal
      destroyOnClose
      title='导入订单'
      visible={modalVisible}
      onOk={okHandle}
      width='800px'
      onCancel={() => handleModalVisible()}
    >
      <Dragger {...exportProps}>
        <p className="ant-upload-drag-icon">
          <Icon type="inbox" />
        </p>
        <p className="ant-upload-text">点击或拖拽上传</p>
      </Dragger>
    </Modal>
  );
});

@Form.create()
class UpdateForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      formVals: {
        name: props.values.name,
        desc: props.values.desc,
        key: props.values.key,
        target: '0',
        template: '0',
        type: '1',
        time: '',
        frequency: 'month',
      },
      currentStep: 0,
    };

    this.formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
  }

  handleNext = currentStep => {
    const { form, handleUpdate } = this.props;
    const { formVals: oldValue } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const formVals = { ...oldValue, ...fieldsValue };
      this.setState(
        {
          formVals,
        },
        () => {
          if (currentStep < 2) {
            this.forward();
          } else {
            handleUpdate(formVals);
          }
        }
      );
    });
  };

  backward = () => {
    const { currentStep } = this.state;
    this.setState({
      currentStep: currentStep - 1,
    });
  };

  forward = () => {
    const { currentStep } = this.state;
    this.setState({
      currentStep: currentStep + 1,
    });
  };

  renderContent = (currentStep, formVals) => {
    const { form } = this.props;
    if (currentStep === 1) {
      return [
        <FormItem key="target" {...this.formLayout} label="监控对象">
          {form.getFieldDecorator('target', {
            initialValue: formVals.target,
          })(
            <Select style={{ width: '100%' }}>
              <Option value="0">表一</Option>
              <Option value="1">表二</Option>
            </Select>
          )}
        </FormItem>,
        <FormItem key="template" {...this.formLayout} label="规则模板">
          {form.getFieldDecorator('template', {
            initialValue: formVals.template,
          })(
            <Select style={{ width: '100%' }}>
              <Option value="0">规则模板一</Option>
              <Option value="1">规则模板二</Option>
            </Select>
          )}
        </FormItem>,
        <FormItem key="type" {...this.formLayout} label="规则类型">
          {form.getFieldDecorator('type', {
            initialValue: formVals.type,
          })(
            <RadioGroup>
              <Radio value="0">强</Radio>
              <Radio value="1">弱</Radio>
            </RadioGroup>
          )}
        </FormItem>,
      ];
    }
    if (currentStep === 2) {
      return [
        <FormItem key="time" {...this.formLayout} label="开始时间">
          {form.getFieldDecorator('time', {
            rules: [{ required: true, message: '请选择开始时间！' }],
          })(
            <DatePicker
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择开始时间"
            />
          )}
        </FormItem>,
        <FormItem key="frequency" {...this.formLayout} label="调度周期">
          {form.getFieldDecorator('frequency', {
            initialValue: formVals.frequency,
          })(
            <Select style={{ width: '100%' }}>
              <Option value="month">月</Option>
              <Option value="week">周</Option>
            </Select>
          )}
        </FormItem>,
      ];
    }
    return [
      <FormItem key="name" {...this.formLayout} label="规则名称">
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: '请输入规则名称！' }],
          initialValue: formVals.name,
        })(<Input placeholder="请输入" />)}
      </FormItem>,
      <FormItem key="desc" {...this.formLayout} label="规则描述">
        {form.getFieldDecorator('desc', {
          rules: [{ required: true, message: '请输入至少五个字符的规则描述！', min: 5 }],
          initialValue: formVals.desc,
        })(<TextArea rows={4} placeholder="请输入至少五个字符" />)}
      </FormItem>,
    ];
  };

  renderFooter = currentStep => {
    const { handleUpdateModalVisible } = this.props;
    if (currentStep === 1) {
      return [
        <Button key="back" style={{ float: 'left' }} onClick={this.backward}>
          上一步
        </Button>,
        <Button key="cancel" onClick={() => handleUpdateModalVisible()}>
          取消
        </Button>,
        <Button key="forward" type="primary" onClick={() => this.handleNext(currentStep)}>
          下一步
        </Button>,
      ];
    }
    if (currentStep === 2) {
      return [
        <Button key="back" style={{ float: 'left' }} onClick={this.backward}>
          上一步
        </Button>,
        <Button key="cancel" onClick={() => handleUpdateModalVisible()}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={() => this.handleNext(currentStep)}>
          完成
        </Button>,
      ];
    }
    return [
      <Button key="cancel" onClick={() => handleUpdateModalVisible()}>
        取消
      </Button>,
      <Button key="forward" type="primary" onClick={() => this.handleNext(currentStep)}>
        下一步
      </Button>,
    ];
  };

  render() {
    const { updateModalVisible, handleUpdateModalVisible } = this.props;
    const { currentStep, formVals } = this.state;

    return (
      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title="规则配置"
        visible={updateModalVisible}
        footer={this.renderFooter(currentStep)}
        onCancel={() => handleUpdateModalVisible()}
      >
        <Steps style={{ marginBottom: 28 }} size="small" current={currentStep}>
          <Step title="基本信息" />
          <Step title="配置规则属性" />
          <Step title="设定调度周期" />
        </Steps>
        {this.renderContent(currentStep, formVals)}
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ order, loading }) => ({
  order,
  loading: loading.models.rule,
}))
@Form.create()
class OrderList extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    expandForm: true,
    selectedRows: [],
    formValues: {},
    stepFormValues: {},
    currentOrder: {},
    sendTimeStart: moment(new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
    sendTimeEnd: moment(new Date(new Date().getTime()), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
    // sendTimeEnd: moment(new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 100), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
  };

  // "continuationPrice": 28.91,
  // "createDate": "2018-10-01 12:18:48",
  // "creator": "admin",
  // "deliveryMode": "送货上楼",
  // "departmentCode": "X",
  // "expressNumber": "WY1911496012",
  // "firstPrice": 28.91,
  // "freight": 26.5,
  // "goodsName": "文件",
  // "id": 0,
  // "insuranceCost": 0.31,
  // "insuredValue": 0,
  // "logisticsCompany": "顺丰",
  // "number": 1,
  // "packageCost": 2.1,
  // "packageType": "纸",
  // "payType": "寄付",
  // "receipt": true,
  // "receiverAddress": "广西壮族自治区桂林市七星区朝阳路信息产业园电商谷",
  // "receiverArea": "北京-北京市-东城区",
  // "receiverCompany": "Y公司",
  // "receiverFixedPhone": "XXXXXXXXX",
  // "receiverName": "李四",
  // "receiverPhone": 1777777777,
  // "remark": "机密文件",
  // "sendTime": "2018-10-01 12:18:48",
  // "senderAddress": "广西壮族自治区桂林市七星区朝阳路信息产业园电商谷",
  // "senderArea": "北京-北京市-东城区",
  // "senderCompany": "X公司",
  // "senderFixedPhone": "XXXXXXXXX",
  // "senderName": "张三",
  // "senderPhone": 18888888888,
  // "totalCost": 28.91,
  // "volumn": 0,
  // "weight": 0.5

  // sendTime: '寄件时间',
  // senderArea: '寄件人区域',
  // senderAddress: '寄件人地址',
  // senderCompany: '寄件人公司',
  // senderFixedPhone: '寄件人固定电话',
  // receiverArea: '收件人区域',
  // receiverAddress: '收件人地址',
  // receiverCompany: '收件人公司',
  // receiverFixedPhone: '收件人固定电话',
  // receiverName: '收件人姓名',
  // receiverPhone: '收件人手机号码',
  // senderName: '寄件人姓名',
  // senderPhone: '寄件人手机号码',

  columns = [
    {
      title: '寄件人姓名',
      dataIndex: 'senderName',
    },
    {
      title: '寄件人地址',
      dataIndex: 'senderAddress',
      render: (text, record) => {
        return `${record.senderArea ? record.senderArea : ''}${text}` || '--'
      },
    },
    {
      title: '寄件人手机号码',
      dataIndex: 'senderPhone',
    },
    {
      title: '寄件时间',
      dataIndex: 'sendTime',
    },
    {
      title: '收件人姓名',
      dataIndex: 'receiverName',
    },
    {
      title: '收件人地址',
      dataIndex: 'receiverAddress',
      render: (text, record) => {
        return `${record.receiverArea ? record.receiverArea : ''}${text}` || '--'
      },
    },
    {
      title: '收件人手机号码',
      dataIndex: 'receiverPhone',
    },

    {
      title: '续价',
      dataIndex: 'continuationPrice',
    },
    // {
    //   title: '创建时间',
    //   dataIndex: 'createDate',
    //   // render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    // },
    {
      title: '创建人',
      dataIndex: 'creator',
    },
    {
      title: '送货方式',
      dataIndex: 'deliveryMode',
      render: (text) => {
        return get({
              0: '送货上门',
              1: '自提',
              2: '送货上楼',
            }, text) || text || '--'
        
      },
    },

    {
      title: '部门代码',
      dataIndex: 'departmentCode',
    },

    {
      title: '快递编号',
      dataIndex: 'expressNumber',
    },

    {
      title: '首价',
      dataIndex: 'firstPrice',
    },

    {
      title: '运费',
      dataIndex: 'freight',
    },


    {
      title: '商品名称',
      dataIndex: 'goodsName',
    },

    {
      title: 'id',
      dataIndex: 'id',
    },

    {
      title: '保险费',
      dataIndex: 'insuranceCost',
    },


    {
      title: '保价金额',
      dataIndex: 'insuredValue',
    },

    {
      title: '物流公司',
      dataIndex: 'logisticsCompany',
    },

    {
      title: '物品数量',
      dataIndex: 'number',
    },
    
    {
      title: '包裹费用',
      dataIndex: 'packageCost',
    },
    {
      title: '包装类型',
      dataIndex: 'packageType',
      render: (text) => {
        return get({
              0: '纸',
              1: '纤',
              2: '托膜',
              3: '木托',
              4: '其他',
            }, text) || text || '--'
        
      },
    },

    {
      title: '支付类型',
      dataIndex: 'payType',
      render: (text) => {
        return get({
              0: '月结',
              1: '寄付',
              2: '到付',
            }, text) || text || '--'
        
      },
    },
  
    {
      title: '创建时间',
      dataIndex: 'createTime',
      // sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      fixed: 'right',
      render: (text, record) => (
        <Fragment>
          <Popconfirm placement="top" title={'你确定要删除吗？'} onConfirm={() => this.deleteOrder(record)} okText="Yes" cancelText="No">
            <a>删除</a>
          </Popconfirm>
          
          <Divider type="vertical" />
          <a onClick={() => this.handleEditOrder(record)}>编辑</a>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'order/fetch',
    });

    dispatch({
      type: 'order/save',
      payload: {
        orderDetail: {},
      }
    });
  }

  deleteOrder = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'order/remove',
      payload: {
        id: record.id,
      },
      callback: () => {
        message.success('删除成功');
        dispatch({
          type: 'order/fetch',
        });
      }
    });
  };

  handleExport = (record) => {
    this.setState({
      modalVisible: true,
      currentOrder: record,
    })
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'user/fetch',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    // dispatch({
    //   type: 'user/fetch',
    //   payload: {},
    // });
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;
    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'user/remove',
          payload: {
            key: selectedRows.map(row => row.key),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;
    const { sendTimeStart, sendTimeEnd } = this.state;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });
      dispatch({
        type: 'order/fetchOrderCondition',
        payload: {
          expressNumber: values.expressNumber,
          logisticsCompany: values.logisticsCompany,
          payType: values.payType,
          receiverArea: values.receiverArea,
          receiverInfo: values.receiverInfo,
          senderArea: values.senderArea,
          senderInfo: values.senderInfo,
          sendTimeStart,
          sendTimeEnd,
          pageInfo: {
            pageNo: 0,
            pageSize: 10000,
          },
        },
      });
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
      currentOrder: {},
    });
  };

  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      updateModalVisible: !!flag,
      stepFormValues: record || {},
    });
  };

  handleAdd = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'order/add',
      payload: {
        ...fields,
        contact: '',
        createTime: '',
        id: '',
      },
      callback: () => {
        message.success('添加成功');
        dispatch({
          type: 'order/fetch',
        });
      }
    });
    this.handleModalVisible();
  };

  handleEdit = fields => {
    const { dispatch } = this.props;
    const { currentOrder } = this.state;
    dispatch({
      type: 'order/update',
      payload: {
        ...currentOrder,
        ...fields,
      },
      callback: () => {
        message.success('更新成功');
        dispatch({
          type: 'order/fetch',
        });
      }
    });
    this.handleModalVisible();
  };

  
  handleUpdate = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/update',
      payload: {
        name: fields.name,
        desc: fields.desc,
        key: fields.key,
      },
    });

    message.success('配置成功');
    this.handleUpdateModalVisible();
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="快递编号">
              {getFieldDecorator('expressNumber', {
                initialValue: '',
              })(<Input placeholder="请输入快递编号" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="发件人信息">
              {getFieldDecorator('senderInfo', {
                initialValue: '',
              })(<Input placeholder="请输入发件人信息" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="收件人信息">
              {getFieldDecorator('receiverInfo', {
                initialValue: '',
              })(<Input placeholder="请输入收件人信息" />)}
            </FormItem>
          </Col>
          {/* <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col> */}
          <Col md={16} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  onChangeDateRange = (list) => {
    const sendTimeStart = list[0].format('YYYY-MM-DD HH:mm:ss');
    const sendTimeEnd = list[1].format('YYYY-MM-DD HH:mm:ss');
    this.setState({
      sendTimeStart,
      sendTimeEnd,
    });
  }

  renderAdvancedForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { sendTimeStart, sendTimeEnd } = this.state;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="快递编号">
              {getFieldDecorator('expressNumber', {
                initialValue: '',
              })(<Input placeholder="请输入快递编号" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="发件人信息">
              {getFieldDecorator('senderInfo', {
                initialValue: '',
              })(<Input placeholder="请输入发件人信息" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="收件人信息">
              {getFieldDecorator('receiverInfo', {
                initialValue: '',
              })(<Input placeholder="请输入收件人信息" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="发件人区域">
              {getFieldDecorator('senderArea', {
                initialValue: '',
              })(<Input placeholder="请输入发件人区域" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="收件人区域">
              {getFieldDecorator('receiverArea', {
                initialValue: '',
              })(<Input placeholder="请输入收件人区域" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="支付方式">
              {getFieldDecorator('payType', {
                initialValue: '',
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="">全部</Option>
                  <Option value="0">月结</Option>
                  <Option value="1">寄付</Option>
                  <Option value="2">到付</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>

        <Row gutter={{ md: 8, lg: 48, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="请输入物流公司">
              {getFieldDecorator('logisticsCompany', {
                initialValue: '',
              })(<Input placeholder="请输入物流公司" />)}
            </FormItem>
          </Col>
          <Col md={16} sm={48}>
            <Form.Item label="发件时间区间">
              {getFieldDecorator('dateRange', {
                initialValue: [moment(sendTimeStart, 'YYYY-MM-DD HH:mm:ss'), moment(sendTimeEnd, 'YYYY-MM-DD HH:mm:ss')],
                rules: [
                  {
                    required: false,
                    message: '请选择时间区间',
                  },
                ],
              })(
                <RangePicker
                  onChange={this.onChangeDateRange}
                  placeholder={['开始时间', '结束时间']}
                  showTime
                  style={{ width: 350 }}
                  format="YYYY-MM-DD HH:mm:ss"
                  value={[moment(sendTimeStart, 'YYYY-MM-DD HH:mm:ss'), moment(sendTimeEnd, 'YYYY-MM-DD HH:mm:ss')]}
                />,
              )}
            </Form.Item>
          </Col>
        </Row>

        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up" />
            </a>
          </div>
        </div>
      </Form>
    );
  }
  

   // {
  //   "expressNumber": "string",
  //   "logisticsCompany": "string",
  //   "pageInfo": {
  //     "pageNo": 0,
  //     "pageSize": 0
  //   },
  //   "payType": "string",
  //   "receiverArea": "string",
  //   "receiverInfo": "李四",
  //   "sendTimeEnd": "2018-11-01 12:18:48",
  //   "sendTimeStart": "2018-09-01 12:18:48",
  //   "senderArea": "string",
  //   "senderInfo": "张三"
  // }


  renderForm() {
    const { expandForm } = this.state;
    return expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  handleAddOrder() {
    const { dispatch } = this.props;
    dispatch(routerRedux.push({
      pathname: '/form/basic-form',
      // query: query,
    }));
  }

  handleDownloadOrder = (e) => {
    e.preventDefault();

    const { dispatch, form } = this.props;
    const { sendTimeStart, sendTimeEnd } = this.state;

    form.validateFields((err, values) => {
      if (err) return;
      // const values = {
      //   ...fieldsValue,
      //   updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      // };

      // this.setState({
      //   formValues: values,
      // });
      dispatch({
        type: 'order/fetchDownload',
        payload: {
          expressNumber: values.expressNumber,
          logisticsCompany: values.logisticsCompany,
          payType: values.payType,
          receiverArea: values.receiverArea,
          receiverInfo: values.receiverInfo,
          senderArea: values.senderArea,
          senderInfo: values.senderInfo,
          sendTimeStart,
          sendTimeEnd,
          pageInfo: {
            pageNo: 0,
            pageSize: 10000,
          },
        },
      });
    });
  }

  handleEditOrder(record) {
    const { dispatch } = this.props;
    dispatch(routerRedux.push({
      pathname: '/form/basic-form',
      query: {
        id: record.id,
      },
    }));
  }

  render() {
    const {
      order: { orderList, pagination },
      loading,
    } = this.props;
   
    const { selectedRows, modalVisible, updateModalVisible, stepFormValues, currentOrder } = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleEdit: this.handleEdit,
      handleModalVisible: this.handleModalVisible,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
    };
    return (
      <PageHeaderWrapper title="订单列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleAddOrder(true)}>
                添加订单
              </Button>
              <Button icon="download" type="primary" onClick={this.handleDownloadOrder}>
                导出订单
              </Button>
              <Button icon="import" type="primary" onClick={this.handleExport}>
                导入订单
              </Button>
              {selectedRows.length > 0 && (
                <span>
                  <Button>批量操作</Button>
                  <Dropdown overlay={menu}>
                    <Button>
                      更多操作 <Icon type="down" />
                    </Button>
                  </Dropdown>
                </span>
              )}
            </div>

            <Table
              // rowKey={rowKey || 'key'}
              // rowSelection={rowSelection}
              rowKey={record => record.id}
              columns={this.columns}
              dataSource={orderList}
              scroll={{ x: 3000, y: 1000 }}
              // pagination={pagination}
              // onChange={this.handleTableChange}
              // {...rest}
            />

            {/* <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={{
                list: OrderList,
                pagination: pagination,
              }}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            /> */}
          </div>
        </Card>
        <CreateForm {...parentMethods} currentOrder={currentOrder} modalVisible={modalVisible} />
        {stepFormValues && Object.keys(stepFormValues).length ? (
          <UpdateForm
            {...updateMethods}
            updateModalVisible={updateModalVisible}
            values={stepFormValues}
          />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default OrderList;
