import ComponentInterface from'../../core/component-interface';var UNDEF,MOUSEOVER='fc-mouseover',MOUSEDOWN='fc-mousedown',MOUSEUP='fc-mouseup',MOUSEMOVE='fc-mousemove',MOUSEOUT='fc-mouseout',CLICK='fc-click';class MouseTracker extends ComponentInterface{constructor(){super(),this.pIndex=1,this.handler=function(a){return function(b){b.originalEvent&&a.getFromEnv('chart')._mouseEvtHandler(b,a.config.evtData)}}(this),this.eventsList=[MOUSEDOWN,MOUSEUP,MOUSEMOVE,CLICK,MOUSEOVER],this.config={},this.config.evtData={}}getMouseEvents(a,b,c){var d=this,e=d._lastDatasetIndex,f=d._lastPointIndex,g=a.type,h={fireOut:!1,events:[]};return g===CLICK?h.events.push(CLICK):g===MOUSEMOVE?e===b&&f===c?(clearTimeout(d.mouseoutTimer),h.events.push(MOUSEMOVE)):(h.events.push(MOUSEOVER),h.fireOut=!0):g===MOUSEDOWN?((e!==b||f!==c)&&(h.fireOut=!0,h.events.push(MOUSEOVER)),h.events.push(MOUSEDOWN)):g===MOUSEOVER?e===b&&f===c?clearTimeout(d.mouseoutTimer):(h.fireOut=!0,h.events.push(MOUSEOVER)):g===MOUSEUP?(d.hasTouchEvent=!1,h.events.push(MOUSEUP)):g===MOUSEOUT?h.fireOut=!0:void 0,h}addEvents(){var a,b,c,d=this,e=d.getFromEnv('chart'),f=e.getChildren('canvas'),g=d.config.evtData,h=d.eventsList;for(e.config.enableMouseOutEvent&&h.push(MOUSEOUT),d._removeListners(),g.chart=e,g.mouseTracker=d,b=0;b<f.length;b++)for(c in a=f[b],h)a.addEventListener(h[c],d.handler)}_removeListners(){var a,b,c,d=this,e=d.getFromEnv('chart'),f=e.getChildren('canvas'),g=d.eventsList;for(c=0;c<f.length;c++)for(b in a=f[c],g)a.removeEventListener(g[b],d.handler);d._removeDocEvents()}_removeDocEvents(){this.eventOutput&&this.eventOutput.unlisten(),this.eventOutput=UNDEF}_dispose(){this._removeListners(),super._dispose()}}export default MouseTracker;