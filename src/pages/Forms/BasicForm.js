import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  InputNumber,
  Radio,
  Icon,
  Tooltip,
  message,
  Row,
  Col,
  Card,
  Divider,
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './style.less';
import moment from 'moment';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const queryString = require('query-string');

@connect(({ order, loading }) => ({
  orderDetail: order.orderDetail,
  submitting: loading.effects['form/submitRegularForm'],
}))
@Form.create()
class BasicForms extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      sendTime: '',
      operateLabel: '添加',
      totalCost: 0,
    };
  }

  static getDerivedStateFromProps = (nextProps, prevState) => {
    const { orderDetail } = nextProps;
    if (orderDetail && orderDetail.sendTime !== prevState.sendTime) {
      console.log('sendTime', orderDetail.sendTime);
      return {
        sendTime: orderDetail.sendTime,
      }
    }
    return null;
  }

  componentDidMount = () => {
    const { dispatch, form, orderDetail, location: { query } } = this.props;

    const { operateLabel } = this.state;
    // const query = queryString.parse(location.search);
    if (query && query.id) {
      this.setState({
        operateLabel: '更新',
      })
      dispatch({
        type: 'order/fetchDetail',
        payload: { id: query.id },
        // callback: () => {
        //   message.success(`${operateLabel}成功`);
        //   dispatch({
        //     type: 'order/fetch',
        //   });
        // }
      });
    }
  }

  handleSubmit = e => {
    const { dispatch, form, orderDetail } = this.props;
    const { operateLabel } = this.state;
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const sendTime = values.sendTime.format('YYYY-MM-DD HH:mm:ss');
        // console.log('sendTime', sendTime);
        // values.sendTime = this.state.sendTime;
        if (orderDetail && orderDetail.id) {
          dispatch({
            type: 'order/update',
            payload: { ...values, sendTime },
            callback: () => {
              message.success(`${operateLabel}成功`);
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
          });
        } else {
          dispatch({
            type: 'order/add',
            payload: { ...values, sendTime },
            callback: () => {
              message.success(`${operateLabel}成功`);
              dispatch({
                type: 'order/fetch',
              });
            }
          });
        }
      }
    });
  };

  onChangeDate = (d) => {
    const sendTime = d.format('YYYY-MM-DD HH:mm:ss');
    const {
      form: { getFieldValue, setFieldsValue },
    } = this.props;
    // setFieldsValue({
    //   sendTime,
    // })
    this.setState({
      sendTime: sendTime,
    });
  }

  onChangeTotalCost = (key) => {
    return (value) => {
      const {
        form: { getFieldValue, setFieldsValue },
      } = this.props;
      let freight = getFieldValue('freight');
      let insuranceCost = getFieldValue('insuranceCost');
      let packageCost = getFieldValue('packageCost');
      if (key === 'freight') {
        freight = value;
      } else if (key === 'insuranceCost') {
        insuranceCost = value;
      } else if (key === 'packageCost') {
        packageCost = value;
      }
      const totalCost = freight + insuranceCost + packageCost;
      setFieldsValue({
        totalCost,
      });
    }
  }

  render() {
    const { submitting, orderDetail, form } = this.props;
    const { operateLabel, totalCost, sendTime } = this.state;
    const {
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const formItemLayout = {
      // labelCol: {
      //   xs: { span: 24 },
      //   sm: { span: 7 },
      // },
      // wrapperCol: {
      //   xs: { span: 24 },
      //   sm: { span: 12 },
      //   md: { span: 10 },
      // },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 7 },
      },
    };

    const keyValueMap  = {
      continuationPrice: '续价',
      createDate: '创建时间',
      creator: '创建人',
      deliveryMode: '送货方式',
      departmentCode: '部门代码',
      expressNumber: '快递编号',
      firstPrice: '首价',
      freight: '运费',
      goodsName: '商品名称',
      id: 'id',
      insuranceCost: '保险费',
      insuredValue: '保价金额',
      logisticsCompany: '物流公司',
      number: '物品数量',
      packageCost: '包裹费用',
      packageType: '包装类型',
      payType: '支付类型',

      receipt: '是否需要回单',
      remark: '备注',
      sendTime: '寄件时间',
      senderArea: '寄件人区域',
      senderAddress: '寄件人地址',
      senderCompany: '寄件人公司',
      senderFixedPhone: '寄件人固定电话',
      receiverArea: '收件人区域',
      receiverAddress: '收件人地址',
      receiverCompany: '收件人公司',
      receiverFixedPhone: '收件人固定电话',
      receiverName: '收件人姓名',
      receiverPhone: '收件人手机号码',
      senderName: '寄件人姓名',
      senderPhone: '寄件人手机号码',
      volumn: '体积',
      weight: '重量',
      totalCost: '运费小计',
    }

    return (
      <PageHeaderWrapper
        title={`${operateLabel}订单`}
        // content={<FormattedMessage id="app.forms.basic.description" />}
      >
        <Card bordered={false}>
          <Form onSubmit={this.handleSubmit} hideRequiredMark style={{ marginTop: 8 }} layout="inline">
            <Card bordered={false} title="寄件人信息">
              <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.senderName}>
                    {getFieldDecorator('senderName', {
                      initialValue: orderDetail.senderName,
                      rules: [
                        {
                          required: true,
                          message: '请输入寄件人姓名',
                        },
                      ],
                    })(<Input placeholder='请输入寄件人姓名' />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.sendTime}>
                    {getFieldDecorator('sendTime', {
                      initialValue: orderDetail.sendTime ? moment(orderDetail.sendTime, 'YYYY-MM-DD HH:mm:ss') : '',
                      rules: [
                        {
                          required: true,
                          message: '请选择寄件时间',
                        },
                      ],
                    })(<DatePicker
                      onChange={this.onChangeDate}
                      placeholder='请选择寄件时间'
                      showTime
                      format="YYYY-MM-DD HH:mm:ss" 
                      // showTime={{ format: 'YYYY-MM-DD HH:mm:ss' }}
                      value={moment(sendTime, 'YYYY-MM-DD HH:mm:ss')}
                    />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.senderArea}>
                    {getFieldDecorator('senderArea', {
                      initialValue: orderDetail.senderArea,
                      rules: [
                        {
                          required: true,
                          message: '请输入寄件人区域',
                        },
                      ],
                    })(<Input placeholder='请输入寄件人区域' />)}
                  </FormItem>
                </Col>
              </Row>

              <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.senderAddress}>
                    {getFieldDecorator('senderAddress', {
                      initialValue: orderDetail.senderAddress,
                      rules: [
                        {
                          required: true,
                          message: '请输入寄件人地址',
                        },
                      ],
                    })(<Input placeholder='请输入寄件人地址' />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.senderCompany}>
                    {getFieldDecorator('senderCompany', {
                      initialValue: orderDetail.senderCompany,
                      rules: [
                        {
                          required: true,
                          message: '请输入寄件人公司',
                        },
                      ],
                    })(<Input placeholder='请输入寄件人公司' />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.senderPhone}>
                    {getFieldDecorator('senderPhone', {
                      initialValue: orderDetail.senderPhone,
                      rules: [
                        {
                          required: true,
                          message: '请输入寄件人手机号码',
                        },
                      ],
                    })(<Input placeholder='请输入寄件人手机号码' />)}
                  </FormItem>
                </Col>
              </Row>

              <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.senderFixedPhone}>
                    {getFieldDecorator('senderFixedPhone', {
                      initialValue: orderDetail.senderFixedPhone,
                      rules: [
                        {
                          required: true,
                          message: '请输入寄件人固定电话',
                        },
                      ],
                    })(<Input placeholder='请输入寄件人固定电话' />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem
                    {...formItemLayout}
                    label={keyValueMap.deliveryMode}
                    // help={<FormattedMessage id="form.public.label.help" />}
                  >
                    <div>
                      {getFieldDecorator('deliveryMode', {
                        initialValue: orderDetail.deliveryMode ? orderDetail.deliveryMode : '0',
                      })(
                        <Radio.Group>
                          <Radio value="0">
                            送货上门
                          </Radio>
                          <Radio value="1">
                            自提
                          </Radio>
                          <Radio value="2">
                            送货上楼
                          </Radio>
                        </Radio.Group>
                      )}
                      {/* <FormItem style={{ marginBottom: 0 }}>
                        {getFieldDecorator('publicUsers')(
                          <Select
                            mode="multiple"
                            placeholder={formatMessage({ id: 'form.publicUsers.placeholder' })}
                            style={{
                              margin: '8px 0',
                              display: getFieldValue('public') === '2' ? 'block' : 'none',
                            }}
                          >
                            <Option value="1">
                              <FormattedMessage id="form.publicUsers.option.A" />
                            </Option>
                            <Option value="2">
                              <FormattedMessage id="form.publicUsers.option.B" />
                            </Option>
                            <Option value="3">
                              <FormattedMessage id="form.publicUsers.option.C" />
                            </Option>
                          </Select>
                        )}
                      </FormItem> */}
                    </div>
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem
                    {...formItemLayout}
                    label={keyValueMap.receipt}
                    // help={<FormattedMessage id="form.public.label.help" />}
                  >
                    <div>
                      {getFieldDecorator('receipt', {
                        initialValue: orderDetail.receipt,
                      })(
                        <Radio.Group>
                          <Radio value={true}>
                            需要
                          </Radio>
                          <Radio value={false}>
                            不需要
                          </Radio>
                        </Radio.Group>
                      )}
                    </div>
                  </FormItem>
                </Col>
              </Row>
            </Card>
            
            <Divider />

            <Card bordered={false} title="收件人信息">
              <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.receiverArea}>
                    {getFieldDecorator('receiverArea', {
                      initialValue: orderDetail.receiverArea,
                      rules: [
                        {
                          required: true,
                          message: '请输入收件人区域',
                        },
                      ],
                    })(<Input placeholder='请输入收件人区域' />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.receiverAddress}>
                    {getFieldDecorator('receiverAddress', {
                      initialValue: orderDetail.receiverAddress,
                      rules: [
                        {
                          required: true,
                          message: '请输入收件人地址',
                        },
                      ],
                    })(<Input placeholder='请输入收件人地址' />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.receiverCompany}>
                    {getFieldDecorator('receiverCompany', {
                      initialValue: orderDetail.receiverCompany,
                      rules: [
                        {
                          required: true,
                          message: '请输入收件人公司',
                        },
                      ],
                    })(<Input placeholder='请输入收件人公司' />)}
                  </FormItem>
                </Col>
              </Row>
   
              <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.receiverFixedPhone}>
                    {getFieldDecorator('receiverFixedPhone', {
                      initialValue: orderDetail.receiverFixedPhone,
                      rules: [
                        {
                          required: true,
                          message: '请输入收件人固定电话',
                        },
                      ],
                    })(<Input placeholder='请输入收件人固定电话' />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.receiverName}>
                    {getFieldDecorator('receiverName', {
                      initialValue: orderDetail.receiverName,
                      rules: [
                        {
                          required: true,
                          message: '请输入收件人姓名',
                        },
                      ],
                    })(<Input placeholder='请输入收件人姓名' />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.receiverPhone}>
                    {getFieldDecorator('receiverPhone', {
                      initialValue: orderDetail.receiverPhone,
                      rules: [
                        {
                          required: true,
                          message: '请输入收件人手机号码',
                        },
                      ],
                    })(<Input placeholder='请输入收件人手机号码' />)}
                  </FormItem>
                </Col>
              </Row>
            </Card>

            <Card bordered={false} title="物品信息" >
              <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.expressNumber}>
                    {getFieldDecorator('expressNumber', {
                      initialValue: orderDetail.expressNumber,
                      rules: [
                        {
                          required: true,
                          message: '请输入快递编号',
                        },
                      ],
                    })(<Input placeholder='请输入快递编号' />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.goodsName}>
                    {getFieldDecorator('goodsName', {
                      initialValue: orderDetail.goodsName,
                      rules: [
                        {
                          required: true,
                          message: '请输入商品名称',
                        },
                      ],
                    })(<Input placeholder='请输入商品名称' />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.number}>
                    {getFieldDecorator('number', {
                      initialValue: orderDetail.number,
                      rules: [
                        {
                          required: true,
                          message: '请输入物品数量',
                        },
                      ],
                    })(<InputNumber placeholder='请输入物品数量' />)}
                  </FormItem>
                  
                </Col>
              </Row>

              <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.departmentCode}>
                    {getFieldDecorator('departmentCode', {
                      initialValue: orderDetail.departmentCode,
                      rules: [
                        {
                          required: true,
                          message: '请输入部门代码',
                        },
                      ],
                    })(<Input placeholder='请输入部门代码' />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.volumn}>
                    {getFieldDecorator('volumn', {
                      initialValue: orderDetail.volumn,
                      rules: [
                        {
                          required: true,
                          message: '请输入物品体积',
                        },
                      ],
                    })(<Input placeholder='请输入物品体积' addonAfter="立方米" />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.weight}>
                    {getFieldDecorator('weight', {
                      initialValue: orderDetail.weight,
                      rules: [
                        {
                          required: true,
                          message: '请输入物品重量',
                        },
                      ],
                    })(<Input placeholder='请输入物品重量' addonAfter="kg" />)}
                  </FormItem>
                </Col>
              </Row>

              <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                <Col md={8} sm={24}>
                  <FormItem
                    {...formItemLayout}
                    label={keyValueMap.packageType}
                    // help={<FormattedMessage id="form.public.label.help" />}
                  >
                    <div>
                      {getFieldDecorator('packageType', {
                        initialValue: orderDetail.packageType ? orderDetail.packageType : '0',
                      })(
                        <Radio.Group>
                          <Radio value="0">
                            纸
                          </Radio>
                          <Radio value="1">
                            纤
                          </Radio>
                          <Radio value="2">
                            托膜
                          </Radio>
                          <Radio value="3">
                            木托
                          </Radio>
                          <Radio value="4">
                            其他
                          </Radio>
                        </Radio.Group>
                      )}
                    </div>
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.logisticsCompany}>
                    {getFieldDecorator('logisticsCompany', {
                      initialValue: orderDetail.logisticsCompany,
                      rules: [
                        {
                          required: true,
                          message: '请输入物流公司',
                        },
                      ],
                    })(<Input placeholder='请输入物流公司' />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.remark}>
                    {getFieldDecorator('remark', {
                      initialValue: orderDetail.remark,
                      rules: [
                        {
                          required: true,
                          message: '请输入备注',
                        },
                      ],
                    })(<Input placeholder='请输入备注'   />)}
                  </FormItem>
                </Col>
              </Row>
            </Card>
            
            <Divider />

            <Card bordered={false} title="费用信息">
              <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} style={{ display: 'none' }} label={keyValueMap.firstPrice}>
                    {getFieldDecorator('id', {
                      initialValue: orderDetail.id ? orderDetail.id : '',
                    })(<Input hidden />)}
                  </FormItem>
                  <FormItem {...formItemLayout} label={keyValueMap.firstPrice}>
                    {getFieldDecorator('firstPrice', {
                      initialValue: orderDetail.firstPrice,
                      rules: [
                        {
                          required: true,
                          message: '请输入首价',
                        },
                      ],
                    })(<InputNumber placeholder='请输入首价' addonAfter="元" />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.continuationPrice}>
                    {getFieldDecorator('continuationPrice', {
                      initialValue: orderDetail.continuationPrice,
                      rules: [
                        {
                          required: true,
                          message: '请输入续价',
                        },
                      ],
                    })(<InputNumber placeholder='请输入续价' addonAfter="元" />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.freight}>
                    {getFieldDecorator('freight', {
                      initialValue: orderDetail.freight ? orderDetail.freight : 0,
                      rules: [
                        {
                          required: true,
                          message: '请输入运费',
                        },
                      ],
                    })(<InputNumber onChange={this.onChangeTotalCost('freight')} placeholder='请输入运费' addonAfter="元" />)}
                  </FormItem>
                </Col>
              </Row>

              <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.insuranceCost}>
                    {getFieldDecorator('insuranceCost', {
                      initialValue: orderDetail.insuranceCost ? orderDetail.insuranceCost : 0,
                      rules: [
                        {
                          required: true,
                          message: '请输入保险费',
                        },
                      ],
                    })(<InputNumber onChange={this.onChangeTotalCost('insuranceCost')} placeholder='请输入保险费' addonAfter="元" />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.insuredValue}>
                    {getFieldDecorator('insuredValue', {
                      initialValue: orderDetail.insuredValue,
                      rules: [
                        {
                          required: true,
                          message: '请输入保价金额',
                        },
                      ],
                    })(<InputNumber placeholder='请输入保价金额' addonAfter="元" />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.packageCost}>
                    {getFieldDecorator('packageCost', {
                      initialValue: orderDetail.packageCost ? orderDetail.packageCost : 0,
                      rules: [
                        {
                          required: true,
                          message: '请输入包裹费用',
                        },
                      ],
                    })(<InputNumber onChange={this.onChangeTotalCost('packageCost')} placeholder='请输入包裹费用' addonAfter="元" />)}
                  </FormItem>
                </Col>
              </Row>

              <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label={keyValueMap.totalCost}>
                    {getFieldDecorator('totalCost', {
                      initialValue: orderDetail.totalCost ? orderDetail.totalCost : 0,
                      rules: [
                        {
                          required: true,
                          message: '请输入运费小计',
                        },
                      ],
                    })(<InputNumber
                      disabled
                      placeholder='请输入运费小计'
                      addonAfter="元"
                    />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem
                    {...formItemLayout}
                    label={keyValueMap.payType}
                    // help={<FormattedMessage id="form.public.label.help" />}
                  >
                    <div>
                      {getFieldDecorator('payType', {
                        initialValue: orderDetail.payType ? orderDetail.payType : '0',
                      })(
                        <Radio.Group>
                          <Radio value="0">
                            月结
                          </Radio>
                          <Radio value="1">
                            寄付
                          </Radio>
                          <Radio value="2">
                            到付
                          </Radio>
                        </Radio.Group>
                      )}
                    </div>
                  </FormItem>
                </Col>
              </Row>
            </Card>
            
            <Divider />

            
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button type="primary" htmlType="submit" loading={submitting}>
                <FormattedMessage id="form.submit" />
              </Button>
              {/* <Button style={{ marginLeft: 8 }}>
                <FormattedMessage id="form.save" />
              </Button> */}
            </FormItem>
          </Form>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BasicForms;
