import Base from'./input-base';import{getMouseCoordinate}from'../../../fc-core/src/lib';class InputSwipeGesture extends Base{constructor(){super();var a=this;a.controlArr=[{nativeInteraction:['fc-dragend'],callback:a.end.bind(a),component:a},{nativeInteraction:['fc-dragmove'],callback:a.move.bind(a),component:a},{nativeInteraction:['fc-dragstart'],callback:a.start.bind(a),component:a}]}getName(){return'swipeGesture'}configure(){super.configure(),this.enable()}getPresentScrollValue(){var a=this,b=a.config.xAxis,c=b.getVisibleConfig(),d=b.getLimit(),e=c.maxValue-c.minValue,f=d.max-d.min;return(c.minValue-d.min)/(f-e)}start(a){var b,c,d=this,e=d.getFromEnv('chart'),f=d.config;b=getMouseCoordinate(e.getFromEnv('chart-container'),a.originalEvent,e),f.previousX=b.chartX,f.presentScrollValue=c=d.getPresentScrollValue(),e.fireChartInstanceEvent('scrollStart',{scrollPosition:c})}move(a){var b,c=this,d=c.config,e=c.getFromEnv('chart'),f=d.xAxis,g=f.getChildren('scrollBar')&&f.getChildren('scrollBar')[0],h=g&&g.getChildren('scrollAnchor')[0],i=f.config.axisRange,j=getMouseCoordinate(e.getFromEnv('chart-container'),a.originalEvent,e),k=j.chartX,l=(k-d.previousX)/d.plotDifference,m=f.getVisibleConfig(),n=d.previousScrollValue=d.presentScrollValue,o=m.minValue-l,p=d.axisMin,q=d.axisMax,r=m.maxValue-l;o<p&&p===m.minValue||r>q&&q===m.maxValue||(o<p?(r+=l,l=m.minValue-p,r-=l,o=p):q<r&&(o+=l,l=q-m.maxValue,o+=l,r=q),b=(o-i.min)/(i.max-i.min-(r-o)),h.config.scrollPosition=b,e.getFromEnv('animationManager').setAnimationState('scroll'),f.setVisibleConfig(o,r),e.fireChartInstanceEvent('onScroll',{scrollPosition:n}),d.previousX=k,d.presentScrollValue=c.getPresentScrollValue())}end(){var a=this,b=a.config,c=a.getFromEnv('chart');c.fireChartInstanceEvent('scrollEnd',{previousScrollPosition:b.previousScrollValue,scrollPosition:b.presentScrollValue})}setControl(){var a=this,b=a.getLinkedParent(),c=a.controlArr;b.releaseControl(c),a.isEnabled()&&b.getControl(c)}draw(){let a=this,b=a.config,c=a.getFromEnv('canvas').getAxes().filter(a=>!a.isY),d=b.xAxis=c&&c[0]&&c[0].axis,e=d.config.axisRange;b.plotDifference=d.getPixel(1)-d.getPixel(0),b.axisMin=e.min,b.axisMax=e.max}}export default InputSwipeGesture;