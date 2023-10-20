// @flow
import * as React from "react";
import _ from "lodash";
import Responsive from '../../lib/ResponsiveReactGridLayout';
import WidthProvider from '../../lib/components/WidthProvider';
import type {CompactType, Layout, LayoutItem, ReactChildren} from '../../lib/utils';
import type {Breakpoint, OnLayoutChangeCallback} from '../../lib/responsiveUtils';
import styled from 'styled-components';



const ResponsiveReactGridLayout = WidthProvider(Responsive);

type Props = {|
  className: string,
  cols: {[string]: number},
  onLayoutChange: Function,
  rowHeight: number,
|};
type State = {|
  currentBreakpoint: string,
  compactType: CompactType,
  mounted: boolean,
  resizeHandles: string[],
  layouts: {[string]: Layout}
|};

const availableHandles = ["s", "w", "e", "n", "sw", "nw", "se", "ne"];


const Wrapper = styled.div`
  position: relative;
  background: red !important;
  min-height: 100vh;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  .react-grid-layout {
    margin: -1px 0;
  }
  .vessel {
    &:hover {
      .draggable,
      .react-resizable-handle {
        opacity: 1;
      }
    }
  }
  .draggable {
    position: absolute;
    top: 0px;
    left: 50%;
    transform: translateX(-50%);
    padding: 3px 0;
    user-select: none;
    cursor: grab;
    opacity: 0;
    transition: all 0.3s ease-in-out;
    z-index: 4;
    hr {
      margin: 0;
      border: 0;
      width: 80px;
      height: 2px;
      background: ${(props) => props.theme.lineColorSecond};
      border-radius: 2px;
      transition: all 0.3s ease-in-out;
    }
    &:hover {
      hr {
        background: #00ba3d;
      }
    }
  }
  .react-resizable-handle {
    background: none;
    opacity: 0;
    transition: all 0.3s ease-in-out;
    z-index: 4;
    &::after {
      border-right: 2px solid ${(props) => props.theme.lineColorSecond} !important;
      border-bottom: 2px solid ${(props) => props.theme.lineColorSecond} !important;
      transition: all 0.3s ease-in-out;
    }
    &:hover::after {
      border-right: 2px solid #00ba3d !important;
      border-bottom: 2px solid #00ba3d !important;
    }
  }
  .main {
    background: grey;
    height: 100%;
  }
`


const REACT_GRID_LAYOUT_BEDROCK = {
  lg: [
    { i: 'infos', x: 0, y: 0, w: 14, h: 2, minW: 8, minH: 2 },
    { i: 'infos2', x: 0, y: 3, w: 14, h: 22, minW: 12, minH: 14 },
    { i: 'infos3', x: 14, y: 0, w: 5, h: 24, minW: 5, minH: 22 },
    { i: 'infos4', x: 0, y: 22, w: 19, h: 20, minW: 10, minH: 8 },
    { i: 'infos5', x: 19, y: 0, w: 5, h: 24, minW: 5, minH: 18 },
    { i: 'infos6', x: 19, y: 0, w: 5, h: 20, minW: 5, minH: 10 },
  ],
  md: [
    { i: 'infos', x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
    { i: 'infos2', x: 0, y: 3, w: 12, h: 20, minW: 10, minH: 14 },
    { i: 'infos3', x: 12, y: 0, w: 4, h: 22, minW: 4, minH: 22 },
    { i: 'infos4', x: 0, y: 22, w: 16, h: 18, minW: 8, minH: 6 },
    { i: 'infos5', x: 16, y: 0, w: 4, h: 22, minW: 4, minH: 18 },
    { i: 'infos6', x: 16, y: 0, w: 4, h: 18, minW: 4, minH: 10 },
  ],
  sm: [
    { i: 'infos', x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
    { i: 'infos2', x: 0, y: 3, w: 12, h: 18, minW: 10, minH: 14 },
    { i: 'infos3', x: 12, y: 0, w: 4, h: 20, minW: 4, minH: 20 },
    { i: 'infos4', x: 0, y: 20, w: 16, h: 16, minW: 8, minH: 6 },
    { i: 'infos5', x: 16, y: 0, w: 4, h: 20, minW: 4, minH: 18 },
    { i: 'infos6', x: 16, y: 0, w: 4, h: 16, minW: 4, minH: 10 },
  ],
  xs: [
    { i: 'infos', x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
    { i: 'infos2', x: 0, y: 3, w: 12, h: 18, minW: 10, minH: 14 },
    { i: 'infos3', x: 12, y: 0, w: 5, h: 20, minW: 5, minH: 20 },
    { i: 'infos4', x: 0, y: 20, w: 17, h: 16, minW: 8, minH: 6 },
    { i: 'infos5', x: 17, y: 0, w: 5, h: 20, minW: 5, minH: 18 },
    { i: 'infos6', x: 17, y: 0, w: 5, h: 16, minW: 5, minH: 10 },
  ],
};

export default class ShowcaseLayout extends React.Component<Props, State> {
  static defaultProps: Props = {
    className: "layout",
    rowHeight: 30,
    onLayoutChange: function() {},
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  };

  state: State = {
    currentBreakpoint: "lg",
    compactType: "vertical",
    resizeHandles: ['se'],
    mounted: false,
    // layouts: { lg: generateLayout(['se']) }
    layouts: REACT_GRID_LAYOUT_BEDROCK
  };

  componentDidMount() {
    this.setState({ mounted: true });
  }

  generateDOM(): ReactChildren {
    return _.map(this.state.layouts.lg, function(l, i) {
      return (
        <div key={i} className={l.static ? "static" : ""}>
          {l.static ? (
            <span
              className="text"
              title="This item is static and cannot be removed or resized."
            >
              Static - {i}
            </span>
          ) : (
            <span className="text">{i}</span>
          )}
        </div>
      );
    });
  }

  onBreakpointChange: (Breakpoint) => void = (breakpoint) => {
    this.setState({
      currentBreakpoint: breakpoint
    });
  };

  onCompactTypeChange: () => void = () => {
    const { compactType: oldCompactType } = this.state;
    const compactType =
      oldCompactType === "horizontal"
        ? "vertical"
        : oldCompactType === "vertical"
        ? null
        : "horizontal";
    this.setState({ compactType });
  };

  onResizeTypeChange: () => void = () => {
    const resizeHandles = this.state.resizeHandles === availableHandles ? ['se'] : availableHandles;
    this.setState({resizeHandles, layouts: {lg: generateLayout(resizeHandles)}});
  };


  onLayoutChange: OnLayoutChangeCallback = (layout, layouts) => {
    
    this.props.onLayoutChange(layout, layouts);
  };

  onNewLayout: EventHandler = () => {
    this.setState({
      layouts: { lg: generateLayout(this.state.resizeHandles) }
    });
  };

  onDrop: (layout: Layout, item: ?LayoutItem, e: Event) => void = (elemParams) => {
    alert(`Element parameters: ${JSON.stringify(elemParams)}`);
  };

   onLayoutChange = (layout, a) => {
    this.setState({
      layouts: a
    });
  };


  render() {
    return (
      <Wrapper>
        <ResponsiveReactGridLayout
          breakpoints={{ lg: 1920, md: 1680, sm: 1440, xs: 1280 }}
          cols={{ lg: 24, md: 20, sm: 20, xs: 22 }}
          draggableHandle=".draggable"
          layouts={this.state.layouts}
          margin={[1,1]}
          containerPadding={[0, 0]}
          rowHeight={34}
          onLayoutChange={this.onLayoutChange}
          isBounded={true}
          isResizable={false}
        >
          <div className="vessel guide-1" key="infos">
            <div className="draggable">
              <hr />
            </div>
            <div className='main'>infos</div>
          </div>
          <div className="vessel guide-1" key="infos2">
            <div className="draggable">
              <hr />
            </div>
            <div className='main'>infos2</div>
          </div>
          <div className="vessel guide-1" key="infos3">
            <div className="draggable">
              <hr />
            </div>
            <div className='main'>infos3</div>
          </div>
          <div className="vessel guide-1" key="infos4">
            <div className="draggable">
              <hr />
            </div>
            <div className='main'>infos4</div>
          </div>
  
          <div className="vessel guide-1" key="infos5">
            <div className="draggable">
              <hr />
            </div>
            <div className='main'>infos5</div>
          </div>
  
          <div className="vessel guide-1" key="infos6">
            <div className="draggable">
              <hr />
            </div>
            <div className='main'>infos6</div>
          </div>
  
  
        </ResponsiveReactGridLayout>
      </Wrapper>
    )
  }
  // render(): React.Node {
  //   // eslint-disable-next-line no-unused-vars
  //   return (
  //     <div>
  //       <div>
  //         Current Breakpoint: {this.state.currentBreakpoint} (
  //         {this.props.cols[this.state.currentBreakpoint]} columns)
  //       </div>
  //       <div>
  //         Compaction type:{" "}
  //         {_.capitalize(this.state.compactType) || "No Compaction"}
  //       </div>
  //       <button onClick={this.onNewLayout}>Generate New Layout</button>
  //       <button onClick={this.onCompactTypeChange}>
  //         Change Compaction Type
  //       </button>
  //       <button onClick={this.onResizeTypeChange}>
  //         Resize {this.state.resizeHandles === availableHandles ? "One Corner" : "All Corners"}
  //       </button>
  //       <ResponsiveReactGridLayout
  //         {...this.props}
  //         layouts={this.state.layouts}
  //         onBreakpointChange={this.onBreakpointChange}
  //         onLayoutChange={this.onLayoutChange}
  //         onDrop={this.onDrop}
  //         // WidthProvider option
  //         measureBeforeMount={false}
  //         // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
  //         // and set `measureBeforeMount={true}`.
  //         useCSSTransforms={this.state.mounted}
  //         compactType={this.state.compactType}
  //         preventCollision={!this.state.compactType}
  //       >
  //         {this.generateDOM()}
  //       </ResponsiveReactGridLayout>
  //     </div>
  //   );
  // }
}


function generateLayout(resizeHandles) {
  return _.map(_.range(0, 25), function(item, i) {
    var y = Math.ceil(Math.random() * 4) + 1;
    return {
      x: Math.round(Math.random() * 5) * 2,
      y: Math.floor(i / 6) * y,
      w: 2,
      h: y,
      i: i.toString(),
      static: Math.random() < 0.05,
      resizeHandles
    };
  });
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then(fn => fn.default(ShowcaseLayout));
}
