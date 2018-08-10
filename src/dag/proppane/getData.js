import React from 'react'
import { Input, Button } from 'antd'
export default class GetDataProp extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            varible: props.originProps.varible ? props.originProps.varible : '',
            xpath: props.originProps.xpath ? props.originProps.xpath : ''
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id) {
            this.setState({
                varible: nextProps.originProps.varible ? nextProps.originProps.varible : '',
                xpath: nextProps.originProps.xpath ? nextProps.originProps.xpath : ''
            })
        }
    }
    render() {
        const { varible, xpath } = this.state
        return (
            <div>
                <div><Button type="primary" onClick={this.handleSave}>保存</Button></div>
                请输入变量名:    <Input onChange={this.changeVal} value={varible} placeholder="Basic usage" />
                请输入xPath:    <Input onChange={this.changeXpath} value={xpath} placeholder="Basic usage" />
            </div>
        )
    }
    changeVal = (e) => {
        this.setState({
            varible: e.target.value
        })
    }
    changeXpath = (e) => {
        this.setState({
            xpath: e.target.value
        })
    }
    handleSave = () => {
        this.props.onSave({ ...this.state })
    }
}