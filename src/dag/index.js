import * as React from "react";
import * as ReactDOM from "react-dom";
import './index.css'
import {
  conditionConnectionDecoder,
  conditionConnectionEncoder,
  transformConnectionDecoder,
  transformConnectionEncoder,
} from "./connectionReducers";
import {
  defaultSettings,
  dottedConnectionStyle,
  selectedConnectionStyle,
} from "./settings/dag-settings";
import { onConnectionEventHandler, onEndPointClick } from "./eventHandlers";
import { setGlobal, theme } from "./styles";

import ReactDAG, { DefaultNode } from "react-dag";
import NodeType1 from "./components/NodeType1/wrapper";
import NodeType2 from "./components/NodeType2";
import NodeType3 from "./components/NodeType3";
import ErrorType from "./components/ErrorType/wrapper";
import EndType from "./components/EndType";
import StartType from "./components/StartType";
import { css, before } from "glamor";
import dagre from "dagre";
import { data } from "./data";
import { cloneDeep } from 'lodash'
import { Button, notification } from 'antd';
import Sider from './menu'
import PropPane from './proppane/index'
// import { setInterval } from "timers";
/* tslint:disable */
const uuidv4 = require("uuid/v4");
/* tslint:enable */

/* tslint:disable */
// const cloneDeep = require("lodash.clonedeep");
/* tslint: enable */

const HEIGHT_OF_HEADER = 90;
const HEIGHT_OF_Button_PANEL = 50;
const headerStyles = css({
  alignItems: "center",
  display: "flex",
  height: `${HEIGHT_OF_HEADER}px`,
  justifyContent: "center",
  margin: 0,
});

const ButtonPanelStyles = css({
  alignItems: "center",
  background: "white",
  display: "flex",
  height: `${HEIGHT_OF_Button_PANEL}px`,
  justifyContent: "center",
});

const ButtonStyles = css({
  border: `1px solid ${theme.main.colors.salmonPink}`,
  boxShadow: `${theme.main.boxShadow()}`,
  fontSize: "inherit",
  margin: "0 5px",
  padding: "5px",
});
const nodeType1Styles = css({
  backgroundColor: theme.main.colors.blueGreen,
});

const nodeType2Styles = css({
  backgroundColor: theme.main.colors.teal,
});

const nodeType3Styles = css({
  backgroundColor: theme.main.colors.yellow,
});

const dagWrapperStyles = css({
  background: "white",
  height: `calc(100vh - ${HEIGHT_OF_HEADER}px - ${HEIGHT_OF_Button_PANEL +
    1}px)`,
  width: "100vw",
});

const registerTypes = {
  connections: {
    dotted: dottedConnectionStyle,
    selected: selectedConnectionStyle,
  },
  endpoints: {},
};
const eventListeners = {
  click: onEndPointClick,
  connection: onConnectionEventHandler,
  endpointClick: onEndPointClick,
};

setGlobal();
// const typeToComponentMap = {
//   action: DefaultNode,
//   condition: DefaultNode,
//   sink: NodeType1,
//   source: DefaultNode,
//   transform: NodeType1,
//   end: DefaultNode,
// };
const typeToComponentMap = {
  action: NodeType2,
  condition: NodeType3,
  sink: NodeType1,
  source: DefaultNode,
  transform: NodeType1,
  end: EndType,
  error: ErrorType,
  start: StartType,
};

const getComponent = (type) =>
  typeToComponentMap[type] ? typeToComponentMap[type] : DefaultNode;

const getLayout = (nodes, connections, separation = 200) => {
  console.log('getLayout', nodes, connections)
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({
    marginx: 0,
    marginy: 0,
    nodesep: 90,
    rankdir: "LR",
    ranker: "longest-path",
    ranksep: separation,
  });
  graph.setDefaultEdgeLabel(() => ({}));

  nodes.forEach(node => {
    const id = node.id;
    graph.setNode(id, { label: node.config ? node.config.label : "", width: 100, height: 100 });
  });

  connections.forEach(connection => {
    graph.setEdge(connection.sourceId, connection.targetId);
  });
  console.log(graph)
  dagre.layout(graph);
  return graph;
};
const graphNodes = getLayout(data.nodes, data.connections);
data.nodes = data.nodes.map(node => {
  const location = graphNodes._nodes[node.id];
  return {
    ...node,
    config: {
      ...node.config,
      style: {
        left: `${location.x}px`,
        top: `${location.y}px`,
      },
    },
  };
});
export default class App extends React.Component {
  state = {
    connections: data.connections,
    nodes: data.nodes,
    zoom: 1,
    isRunning : false,
    result : {},
  };
  addNode = (RectType, ActualType) => {
    const generateNodeConfig = (RectType, ActualType) => ({
      config: {
        label: `Node Type: ${ActualType}`,
        type: RectType,
        actualType: ActualType
      },
      id: uuidv4().replace(/-/g,'0'),
    });
    this.setState({
      nodes: [...this.state.nodes, generateNodeConfig(RectType, ActualType)],
    });
  };
  setZoom = (zoomIn) => {
    if (zoomIn) {
      this.setState({ zoom: this.state.zoom + 0.2 });
    } else {
      this.setState({ zoom: this.state.zoom - 0.2 });
    }
  };
  render() {
    const { curBlock, curIndex,isRunning,result } = this.state
    console.log(this.state.nodes, this.state.connections)
    return [
      <h1 className={`${headerStyles}`} key="title">
        Visible spider with React DAG
      </h1>,
      <div className={`${ButtonPanelStyles}`} key="Button-panel">
        <Button
          // className={`${ButtonStyles}`}
          onClick={this.setZoom.bind(this, true)}
        >
          Zoom in
      </Button>
        <Button
          // className={`${ButtonStyles}`}
          onClick={this.setZoom.bind(this, false)}
        >
          Zoom out
      </Button>
        <Button onClick={this._handleDeleteNode}>
          删除结点
      </Button>
        <Button
          // className={`${ButtonStyles}`}
          type="primary"
          onClick={this._generateProcess}
          disabled = {isRunning?true: false}
          loading ={isRunning?true: false}
        >
          {isRunning?'正在执行':'执行'}
      </Button>
      </div>,
      <div className="content">
        <Sider onClick={this.addNode}></Sider>
        <div className="dag-area">
          <ReactDAG
            className={`${dagWrapperStyles}`}
            key="dag"
            connections={cloneDeep(this.state.connections)}
            nodes={cloneDeep(this.state.nodes)}
            jsPlumbSettings={defaultSettings}
            connectionDecoders={[
              transformConnectionDecoder,
              conditionConnectionDecoder,
            ]}
            connectionEncoders={[
              transformConnectionEncoder,
              conditionConnectionEncoder,
            ]}
            eventListeners={eventListeners}
            registerTypes={registerTypes}
            onChange={({ nodes, connections }) => {
              this.setState({ nodes, connections }); // un-necessary cycle??
            }}
            zoom={this.state.zoom}
          >
            {this.state.nodes.map((node, i) => {
              const Component = getComponent(node.config.type);
              return <Component cKey={i} key={i} id={node.id} click={this.showPropPane} />;
            })}
          </ReactDAG>
          {curBlock&&!isRunning ? <div className="proppane" >
            <PropPane {...curBlock} onSave={this.saveProps}></PropPane>
          </div> : null}
          {
            isRunning?
            <div className="proppane" >
              {JSON.stringify(result, null, '\t')}
            </div>:null
          }
        </div>

      </div>,

    ];
  }
  _getResponse = async () => {
    let id = this.currentId
    let returnData = await fetch('/getData', {
      body: JSON.stringify({ id }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
    }).then(response => response.json())
    // console.log(JSON.stringify(ret))
    if (returnData.data) {
      // for( let i)
      Object.keys(returnData.data).forEach((feId) => {
        let result = this.state.result
        result[feId] =returnData.data[feId]
        this.setState({
          result
        })
        if (returnData.data[feId] !== 'error') {
          console.log(feId)
          // document.getElementById(feId).style.border = "2px solid green"
          // document.getElementById(feId).style.background = "repeating-linear-gradient(45deg,#fb3,#fb3 15px,#58a 0,#58a 30px);"
          document.getElementById(feId).style.background = "#58c374"
          document.getElementById(feId).style.backgroundImage = "repeating-linear-gradient(45deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,.1) 15px,transparent 0,transparent 30px),repeating-linear-gradient(-45deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,.1) 15px,transparent 0,transparent 30px)"
        }
        if (feId === 'end' && returnData.data[feId] === 'success') {
          // console.log('clear', this.intervalId)
          clearInterval(this.intervalId)
          this.setState({
            isRunning: false
          })
          notification.success({
            message: '爬虫结束',
          });
        }
      })
    }
  }

  _generateProcess = async () => {
    const { nodes, connections } = this.state
    nodes.forEach((item)=>{
      document.getElementById(item.id).style.border=""
      document.getElementById(item.id).style.background=""
    })

    let nodeObj = nodes.reduce((before, current) => { before[current.id] = current; return before; }, {})
    let connectionObj = connections.reduce((before, current) => { before[current.sourceId] = current; return before; }, {})
    // console.log(nodeObj, connectionObj)
    const id = uuidv4()
    this.currentId = id
    let configData = []
    let currentConnection = connectionObj[connectionObj['start'].sourceId]
    // delete nodeObj[currentConnection.sourceId].config.style
    nodeObj[currentConnection.sourceId].config.feId = nodeObj[currentConnection.sourceId].id
    nodeObj[currentConnection.sourceId].config.id = id
    configData.push(nodeObj[currentConnection.sourceId].config)
    for (; ;) {
      let currentNode = nodeObj[currentConnection.targetId]
      //待优化 here
      currentNode.config.id = id
      currentNode.config.feId = currentNode.id
      // delete currentNode.config.style
      configData.push(currentNode.config)
      if (currentConnection.targetId === "end") {
        break
      }
      currentConnection = connectionObj[currentConnection.targetId]
    }
    console.log(JSON.stringify({ configData }))

    let returnData = await fetch('/setKey', {
      body: JSON.stringify({ configData }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
    }).then(response => response.json())
    // console.log(JSON.stringify(ret))
    console.log(returnData)

    // this.getData = 
    this.setState({
      isRunning: true
    })
    this.intervalId = setInterval(this._getResponse, 500)

    console.log(nodes)
  }
  saveProps = (id, data) => {
    let { curIndex, nodes } = this.state
    nodes[curIndex].config.data = Object.assign({}, nodes[curIndex].config.data, data)
    this.setState({
      nodes: nodes
    })

  }
  _handleDeleteNode = () => {
    const { curBlock, curIndex, nodes } = this.state
    let preNodes = nodes
    preNodes.splice(curIndex, 1)
    console.log(preNodes)
    this.setState({
      nodes: preNodes
    })

  }

  showPropPane = (id, key) => {
    const { nodes } = this.state
    console.log(id, key)
    console.log(nodes[key])
    this.setState({
      curBlock: nodes[key],
      curIndex: key,
      isRunning: false,
    })
  }
}

// ReactDOM.render(<App />, document.getElementById("app-dag"));
