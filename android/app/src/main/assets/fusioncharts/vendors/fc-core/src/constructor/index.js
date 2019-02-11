import{pluck,pluckNumber,fcEach,extend2,POINTER,domInsertModes,hasSVG,normalizeCSSDimension,convertColor,isIE}from'../lib';import{addListener,removeListener,raiseWarning,triggerEvent,raiseError,setRootSender,disposeEvents}from'../event-api';import{addDep,getDep,getDepsByType}from'../dependency-manager';import{onDataUpdateSuccess,onDataUpdateCancel}from'../updater';import rendererEvents from'../renderer-events';import createChart,{globalStore}from'./create-chart';import SmartLabelManager from'../_internal/vendors/fusioncharts-smartlabel/src/SmartlabelManager';import{priorityList}from'../schedular';import FileStore from'./file-store';import globalPolicies from'./global-policies';import NumberFormatter from'../number-formatter';import RedRaphael from'../_internal/redraphael/redraphael';import RedRaphaelSVG from'../_internal/redraphael/redraphael.svg';import JSONTranscoder from'../json-transcoder';import RedRaphaelExtensions from'../_internal/redraphael/redraphael.ext';import BaseChart from'../base-chart';import ToolTipAdapter from'../dummy-tooltip-controller';const NATIVE_FORMAT='json',FCS='undefined'==typeof FCS_VERSION?'':FCS_VERSION,FW='undefined'==typeof FW_VERSION?'':FW_VERSION,PC='undefined'==typeof PC_VERSION?'':PC_VERSION,FC='undefined'==typeof FC_VERSION?'':FC_VERSION,FM='undefined'==typeof FM_VERSION?'':FM_VERSION,FT='undefined'==typeof FT_VERSION?'':FT_VERSION,SCRIPT_NAME_RE=/(^|[\/\\])(fusioncharts\.js)([\?#].*)?$/gi,SIGNATURE_MATCH_RE=/^(FusionCharts|FusionWidgets|FusionMaps)/,LENGTH_CLEANUP_RE=/[^\%\d]*$/gi,URL_RE=/url$/i,MAP_NEEDED='undefined'!=typeof HAS_MAPS&&HAS_MAPS,sanitiseFormatStr=e=>e.toString().toLowerCase(),handleContainerVisibility=function(){var e,t={},a=()=>({state:2}),s=function(){var r,n,i,o,d,l=0,g=parseInt(FusionCharts.options.visibilityTrackingInterval,10)||300;for(r in t)l+=1,n=t[r].chart,i=t[r].container,o=t[r].insertMode,d=t[r].callback,n.disposed||!isHidden(i)?(delete t[r],l-=1,delete n.containerHidden,!n.disposed&&(n.renderOpts={containerElement:i,insertMode:o,callback:d}),n._addChartDependency('chartContainer',{scopeOf:n,opts:{containerElement:i,insertMode:o,callback:d},resolve:handleRender}),n._setState()):t[r]&&t[r].chart&&(t[r].chart.containerHidden=!0,t[r].chart._addChartDependency('chartContainer',{resolve:a}),t[r].chart._setState());e=l?setTimeout(s,g):clearTimeout(e)};return function(a,r,n,i){t[a.id]={chart:a,container:r,insertMode:n,callback:i},e||(e=setTimeout(s,parseInt(FusionCharts.options.visibilityTrackingInterval,10)||300))}}(),isHidden=function(){var e=function(e,t){return window.getComputedStyle?t=window.getComputedStyle(e).getPropertyValue(t):e.currentStyle&&(t=e.currentStyle[t]),t},t=function(a){var s=a.parentNode;return!!s&&9!==s.nodeType&&(!('none'!==e(a,'display'))||!!s&&t(s))};return t}();let isReady,vmlRenderer,smartLabelManager,count=0,registerError=!1,stateListOnPriority=['disposed','error','waiting','ready','initialized'],NFStore={},docLink='https://www.fusioncharts.com/dev/migration/deprecated-functionalities?version=3.13.0',registerErrorMessage='You are using incompatible files or deprecated "register" API of FusionCharts, please go through the docs to know more at https://www.fusioncharts.com/dev/migration/deprecated-functionalities?version=3.13.0',readyFusionCharts=()=>{setTimeout(()=>{isReady=!0,triggerEvent('ready',FusionCharts,{version:FusionCharts.version,now:!0})},1)},slHandler=function(){FusionCharts.removeEventListener('initialized',slHandler),smartLabelManager=new SmartLabelManager(document.body||document.getElementsByTagName('body')[0]),globalStore.addToEnv('smartLabel',smartLabelManager)};function getStateForDep(){return this.state}function getMsgForDep(){return this.msg}function getMsgStyleForDep(){return this.msgStyle}function uniqueId(){return`chartobject-${uniqueId.lastId+=1}`}uniqueId.lastId=0;function objToLowerCase(e){let t,a={};for(t in e)a[t.toLowerCase()]=e[t];return a}function objToHash(e){let t,a=[];for(t in e)a.push(t+'_'+e[t]);return a.sort(),a.join(',')}function deconstructPolicySet(e,t,a){var s,r;for(s in e)if(e[s]instanceof Array)t[e[s][0]]=a[s];else for(r in e[s])t[e[s][r][0]]=a[s][r]}function _getParsedArgs(e,t,a,s){return{native:a===NATIVE_FORMAT,dataFormat:a,format:NATIVE_FORMAT,data:t,dataSource:e,silent:!!s}}function getScriptBaseUri(e){var t,a,s=window.document.getElementsByTagName('script'),r=s.length;for(a=0;a<r;a+=1)if(t=s[a].getAttribute('src'),'undefined'!=typeof t&&null!==t&&null!==t.match(e))return t.replace(e,'$1')}function isDuplicateId(e,t){var a,s,r,n=document.getElementById(e),o=t.id||t.getAttribute('id');if(null===n)return!1;if(e===o)return!0;for(a=t.getElementsByTagName('*'),s=0,r=a.length;s<r;s++)if(a[s]===n)return!1;return!0}function purgeDOM(e){var t,s,r,o=e.attributes;if(o)for(t=o.length-1;0<=t;t-=1)r=o[t].name,'function'==typeof e[r]&&(e[r]=null);if(o=e.childNodes,o)for(s=o.length,t=0;t<s;t+=1)purgeDOM(e.childNodes[t])}function getdataLoadStartMessage(e){let t,a,s=e.options,r=e.args;return t={imageHAlign:pluck(r.dataLoadStartMessageImageHAlign,s.baseChartMessageImageHAlign).toLowerCase(),imageVAlign:pluck(r.dataLoadStartMessageImageVAlign,s.baseChartMessageImageVAlign).toLowerCase(),imageAlpha:pluckNumber(r.dataLoadStartMessageImageAlpha,s.baseChartMessageImageAlpha),imageScale:pluckNumber(r.dataLoadStartMessageImageScale,s.baseChartMessageImageScale)},a={fontFamily:r.dataLoadStartMessageFont||s.baseChartMessageFont,fontSize:r.dataLoadStartMessageFontSize||s.baseChartMessageFontSize,color:r.dataLoadStartMessageColor||s.baseChartMessageColor},{msg:s.dataLoadStartMessage,msgStyle:{image:t,message:a}}}function getDataInvalidMessage(e){let t,a,s=e.options,r=e.args;return t={imageHAlign:pluck(r.dataInvalidMessageImageHAlign,s.baseChartMessageImageHAlign).toLowerCase(),imageVAlign:pluck(r.dataInvalidMessageImageVAlign,s.baseChartMessageImageVAlign).toLowerCase(),imageAlpha:pluckNumber(r.dataInvalidMessageImageAlpha,s.baseChartMessageImageAlpha),imageScale:pluckNumber(r.dataInvalidMessageImageScale,s.baseChartMessageImageScale)},a={fontFamily:r.dataInvalidMessageFont||s.baseChartMessageFont,fontSize:r.dataInvalidMessageFontSize||s.baseChartMessageFontSize,color:r.dataInvalidMessageColor||s.baseChartMessageColor},{msg:s.dataInvalidMessage,msgStyle:{image:t,message:a}}}function getLoadChartMessage(e){let t,a,s=e.options,r=e.args,n=e.options.showChartLoadingMessage;return t={imageHAlign:r.loadMessageImageHAlign||s.baseChartMessageImageHAlign,imageVAlign:r.loadMessageImageVAlign||s.baseChartMessageImageVAlign,imageAlpha:r.loadMessageImageAlpha||s.baseChartMessageImageAlpha,imageScale:r.loadMessageImageScale||s.baseChartMessageImageScale},a={color:r.loadMessageColor||s.baseChartMessageColor,fontFamily:r.loadMessageFont||s.baseChartMessageFont,fontSize:r.loadMessageFontSize||s.baseChartMessageFontSize},{msg:n?s.PBarLoadingText||s.loadMessage:'',msgStyle:{message:a,image:t}}}function showUnsupportedChartMessage(e){var t,a,s=e.args,r=e.options;return t={imageHAlign:s.typeNotSupportedMessageImageHAlign||r.baseChartMessageImageHAlign,imageVAlign:s.typeNotSupportedMessageImageVAlign||r.baseChartMessageImageVAlign,imageAlpha:s.typeNotSupportedMessageImageAlpha||r.baseChartMessageImageAlpha,imageScale:s.typeNotSupportedMessageImageScale||r.baseChartMessageImageScale},a={color:s.typeNotSupportedMessageColor||r.baseChartMessageColor,fontFamily:s.typeNotSupportedMessageFont||r.baseChartMessageFont,fontSize:s.typeNotSupportedMessageFontSize||r.baseChartMessageFontSize},registerError&&(r.messageURL=docLink),{msg:registerError?registerErrorMessage:r.typeNotSupportedMessage,msgStyle:{image:t,message:a}}}function showUnsupportedBrowserMessage(e){var t,a,s=e.args,r=e.options;return t={imageHAlign:s.browserNotSupportedMessageImageHAlign||r.baseChartMessageImageHAlign,imageVAlign:s.browserNotSupportedMessageImageVAlign||r.baseChartMessageImageVAlign,imageAlpha:s.browserNotSupportedMessageImageAlpha||r.baseChartMessageImageAlpha,imageScale:s.browserNotSupportedMessageImageScale||r.baseChartMessageImageScale},a={color:s.browserNotSupportedMessageColor||r.baseChartMessageColor,fontFamily:s.browserNotSupportedMessageFont||r.baseChartMessageFont,fontSize:s.browserNotSupportedMessageFontSize||r.baseChartMessageFontSize},{msg:r.browserNotSupportedMessage,msgStyle:{image:t,message:a}}}function registerEvtHandler(){registerError=!0}function _setChartData(e){let t,a,s,r,{data:n,sanitisedFormat:i,silent:o}=this.opts,d=getDepsByType('transcoder'),l=d[i]&&d[i](),g=e.options,{msg:p,msgStyle:c}=getDataInvalidMessage(e);return e.__state.newDataArrived=!0,l?l.toJSON?(a=l.toJSON(n,e),r=a.error?{state:1,msg:p,msgStyle:c}:{state:3}):(a={error:new Error('Unable to convert data.')},r={state:1,msg:p,msgStyle:c}):(a={error:new Error('Unable to convert data.')},r={state:1,msg:p,msgStyle:c}),t=a.error?a:a.data,g.dataErroneous=g.error=a.error,g.dataSource=t,g.dataFormat=i,s=_getParsedArgs(n,t,i,o),g.dataErroneous||triggerEvent('beforeDataUpdate',e,s,void 0,onDataUpdateSuccess,onDataUpdateCancel),r}function _setChartDataUrl(e){let t,a,{url:o='',format:s,config:r,callback:n,silent:i}=this.opts,d=getDepsByType('transcoder'),{msg:l,msgStyle:g}=getdataLoadStartMessage(e);return('undefined'==typeof s||null===s||'function'!=typeof s.toString)&&(s=e.options.dataFormat,raiseWarning(e,'03091609','param','FusionCharts#setChartDataUrl','Invalid Data Format. Reverting to current data format - '+s)),t=sanitiseFormatStr(s),URL_RE.test(t)||(t+='url'),a=d[t]&&d[t](),e.jsVars.stallLoad=!0,a?a.toJSON?(a.toJSON(o,r,n,i,e),{state:2,msg:l,msgStyle:g}):{state:1,error:new Error('Unable to fetch data.')}:{state:1,error:new Error('Unable to fetch data.')}}function onChartTypeChange(e){let t,a,s=e.__state,r=e.chartType(),n=getDep(s.lastRenderedType,'chartapi')||getDep(s.lastRenderedType,'maps');if(n&&s.lastRenderedType!==r&&(triggerEvent('chartTypeChanged',e,{previousType:s.lastRenderedType,newType:r}),t=n,t))for(a in t)delete e[a];s.lastRenderedType=r}function mapResolver(e){let{msgStyle:t,msg:a}=getLoadChartMessage(e);return import('../../../../maps').then(t=>{FusionCharts.addDep(t['default']),onChartTypeChange(e),e._addChartDependency('mapModuleLoad',{resolve:()=>({state:3})}),triggerEvent('loaded',e,{type:e.chartType(),renderer:'javascript'},[e.id]),e._setState()})['catch'](()=>{let{msgStyle:t,msg:a}=showUnsupportedChartMessage(e);e._addChartDependency('mapModuleLoad',{resolve:()=>({state:1,msgStyle:t,msg:a})}),raiseError(FusionCharts,'12052314141','run','JavaScriptRenderer~Maps',new Error('FusionCharts\' maps file is required to render the visualization.')),e._setState(),triggerEvent('charttypeinvalid',e,{},[e.id])}),{state:2,msgStyle:t,msg:a}}function handleChartModuleLoading(e){let t=this.opts.value,a=FusionCharts.getDep(t,'dependency')||FusionCharts.getDep(t,'chartapi')||FusionCharts.getDep(t,'maps');if(registerError=!1,a){if(a.then){FusionCharts.addEventListener('register',registerEvtHandler),a.then(a=>{if(!e.disposed){if(a.__esModule){let s=getDep(t,'maps');FusionCharts.addDep(a['default']),s&&MAP_NEEDED||onChartTypeChange(e),e._addChartDependency('chartModuleLoad',{resolve:()=>(s&&MAP_NEEDED?e._addChartDependency('mapModuleLoad',{scopeOf:e,resolve:mapResolver}):triggerEvent('loaded',e,{type:t,renderer:'javascript'},[e.id]),{state:3})})}else e._addChartDependency('chartModuleLoad',{resolve:()=>(getDep(t,'maps')&&MAP_NEEDED?e._addChartDependency('mapModuleLoad',{scopeOf:e,resolve:mapResolver}):(onChartTypeChange(e),triggerEvent('loaded',e,{type:t,renderer:'javascript'},[e.id])),{state:3})});e._setState()}})['catch'](()=>{if(e.disposed)return;let{msgStyle:t,msg:a}=showUnsupportedChartMessage(e);e._addChartDependency('chartModuleLoad',{resolve:()=>({state:1,msgStyle:t,msg:a})}),e._setState(),triggerEvent('charttypeinvalid',e,{},[e.id])});let{msgStyle:s,msg:r}=getLoadChartMessage(e);return{state:2,msgStyle:s,msg:r}}return getDep(t,'maps')&&MAP_NEEDED?(e._addChartDependency('mapModuleLoad',{scopeOf:e,resolve:mapResolver}),e._setState()):(onChartTypeChange(e),triggerEvent('loaded',e,{type:t,renderer:'javascript'},[e.id])),{state:3}}else{let{msgStyle:t,msg:a}=showUnsupportedChartMessage(e);return triggerEvent('charttypeinvalid',this,{},[this.id]),{state:1,msgStyle:t,msg:a}}}function handleRender(e){let t,a,r,n,{containerElement:i,insertMode:o,callback:d}=this.opts;if(d?'function'!=typeof d&&(d=void 0):'function'==typeof o?(d=o,o=void 0):!o&&'function'==typeof i&&(d=i,i=void 0),o=(o||e.options.insertMode).toLowerCase()||domInsertModes.REPLACE,'undefined'==typeof i&&(i=e.options.containerElementId||e.options.containerElement),'string'==typeof i&&(i=document.getElementById(i)),'undefined'==typeof i||null===i)return raiseError(e,'03091456','run','.render()',new Error('Unable to find the container DOM element.')),triggerEvent('containernotfound',e,{},[e.id]),{state:1};if(isDuplicateId(e.id,i))return raiseError(e,'05102109','run','.render()',new Error('A duplicate object already exists with the specific Id: '+e.id)),{state:1};if(isHidden(i))return e.containerHidden=!0,handleContainerVisibility(e,i,o,d),{state:2};if(delete e.containerHidden,((a=window[e.id])&&a.FusionCharts&&a.FusionCharts===e||(a=e.ref)&&a.FusionCharts&&a.FusionCharts===e)&&(e._dispose(),a===window[e.id]&&(window[e.id]=void 0)),'undefined'!=typeof window[e.id])return raiseError(e,'25081843','comp','.render',new Error('#25081843:IECompatibility() Chart Id is same as a JavaScript variable name. Variable naming error. Please use unique name for chart JS variable, chart-id and container id.')),{state:1};if(t=document.createElement(e.options.containerElementType||'span'),t.setAttribute('id',e.id),'append'!==o&&'prepend'!==o)for(;i.hasChildNodes();)i.removeChild(i.firstChild);return'prepend'===o&&i.firstChild?i.insertBefore(t,i.firstChild):i.appendChild(t),e.options.containerElement=i,e.options.containerElementId=i.id,(n=t.style)&&(n.position='relative',n.textAlign='left',n.lineHeight='normal',n.display='inline-block',n.zoom='1',n['vertical-align']='middle',n.fontWeight='normal',n.fontVariant='normal',n.fontStyle='normal',n.textDecoration='none',n['*DISPLAY']='inline',n.padding='0',n.margin='0',n.border='none',n.direction='ltr'),e.options.containerClassName&&(t.className=e.options.containerClassName),r=normalizeCSSDimension(e.width,e.height,t),e.__state.renderedWidth=r.pixelWidth,e.__state.renderedHeight=r.pixelHeight,e.__state.rendering=!0,e.renderOpts={containerElement:t,insertMode:o,callback:d},{state:3}}class FusionCharts{constructor(...e){let t={};this.__state={},this.id='',this._deps={},this.__state._unresolvedDeps={},this.__state.state=4,1===e.length&&'object'==typeof e[0]&&(t=e[0]),1<e.length&&'object'==typeof e[e.length-1]&&extend2(t,e[e.length-1],!1,!0),this.id='undefined'==typeof t.id?uniqueId():t.id,this.args=t,this._parsePolicies(globalPolicies),this._attachDefaultEventListeners(),this.jsVars.fcObj=this,triggerEvent('beforeInitialize',this,t),FusionCharts.items[this.id]instanceof FusionCharts&&raiseWarning(this,'06091847','param','',new Error(`A FusionCharts object with the specified id "${this.id}" already exists.`+`Renaming it to ${this.id=uniqueId()}`)),this.attributes.id=this.id,'undefined'!=typeof __webpack_public_path__&&(__webpack_public_path__=FusionCharts.getScriptBaseURI()),this.chartType&&this.chartType(t.type||t.swfUrl||''),this.setChartData(this.args.dataSource,this.args.dataFormat,void 0,void 0,!0),FusionCharts.items[this.id]=this,FusionCharts.defaultOptions=FusionCharts.options,triggerEvent('initialized',this,t),this._setState()}static getObjectReference(e=''){return FusionCharts.items[e]&&FusionCharts.items[e].ref}static register(){triggerEvent('register',FusionCharts,arguments,void 0,function(){raiseError(this,'0604111219','run','.register()',new Error(registerErrorMessage))})}static render(e,t){return e instanceof FusionCharts?(e.render(t),e):new FusionCharts(e).render(t)}static addDep(...e){return addDep.call(this,...e)}static getDep(e,t){return getDep.call(this,e,t)}static addEventListener(e,t){return addListener(e,t)}static on(e,t){return FusionCharts.addEventListener(e,t)}static removeEventListener(e,t){return removeListener(e,t)}static ready(e,t=FusionCharts,a=FusionCharts){let s=()=>{e.call(a,t)};'function'==typeof e&&(isReady?setTimeout(s,0):FusionCharts.addEventListener('ready',s))}static formatNumber(e,t={},a){t=objToLowerCase(t);let s,r,n=objToHash(t);return NFStore[n]?s=NFStore[n]:NFStore[n]=s=new NumberFormatter(t,{useScaleRecursively:!0}),s.configure(t),r=s.dataLabels(e,a),r}static transcodeData(e,t,a,s){let r,n,i,o,d=getDepsByType('transcoder'),l=sanitiseFormatStr(a),g=sanitiseFormatStr(t);return g&&'function'==typeof g.toString&&l&&'function'==typeof l.toString&&'undefined'!=typeof d[l]&&'undefined'!=typeof d[g]?(i=d[g](),o=d[l](),i.toJSON&&(r=i.toJSON(e,this),n=o.fromJSON(r.data,this)),r.error instanceof Error||(n.error=r.error),s?n:n.data):void raiseError(this,'14090217','param','.transcodeData()','Unrecognized data-format specified during transcoding.')}static setAnimation(e){FusionCharts.options._globalAnimationRule||(FusionCharts.options._globalAnimationRule=[]),FusionCharts.options._globalAnimationRule.push(e)}static setEasingEffect(e,t){FusionCharts.getDep('redraphael','plugin').easing_formulas[e]=t}static getScriptBaseURI(){return FusionCharts.options.scriptBaseUri}static setScriptBaseURI(e){FusionCharts.options.scriptBaseUri=e,'undefined'!=typeof __webpack_public_path__&&(__webpack_public_path__=e)}static getChartFromId(e){return FusionCharts.items[e]}static getVersion(e){let t={fcs:FCS,fc:FC,fw:FW,pc:PC,fm:FM,ft:FT};return t[e]||t}_attachDefaultEventListeners(){let e,t,a=this,s=a.options.events;if(s)for(e in s)'function'==typeof s[e]&&a.addEventListener(e,s[e]);for(t in a.options.renderer='javascript',rendererEvents)a.addEventListener(t,rendererEvents[t])}_setState(){let e,t,a=this,s=a._deps,r=a.__state.state,n=4;for(let r in s)s.hasOwnProperty(r)&&(e=s[r],t=e.getState(),n>t&&(n=t,a.__state.currChartMsg=e.getMsg(),a.__state.currChartMsgStyle=e.getMsgStyle()),3===t&&a._removeChartDependency(r));if(a.__state.prevState=r,a.__state.state=n,r!==n&&triggerEvent('stateChanged',a,{prevState:stateListOnPriority[r],state:stateListOnPriority[n]},[a.id]),!a.containerHidden)if(3==n&&a.__state.renderInvoked){let{containerElement:e,callback:t}=a.renderOpts;a._renderChart(e,void 0,t),this._clearPrevContext(),delete a.renderOpts.callback}else if((2==n||1==n)&&a.__state.renderInvoked&&a._contextChanged()&&!(a.__state.renderComplete&&2==n)){let{containerElement:e,callback:t}=a.renderOpts;a._renderChart(e,'base',1==n&&t,a.__state.currChartMsg,a.__state.currChartMsgStyle),1==n&&delete a.renderOpts.callback}}_clearPrevContext(){this.__state.prevChartMsg='',this.__state.prevChartMsgStyle={}}_contextChanged(){if(this.__state.currChartMsg!==this.__state.prevChartMsg)return this.__state.prevChartMsg=this.__state.currChartMsg,this.__state.prevChartMsgStyle=this.__state.currChartMsgStyle,!0;let e=this.__state.prevChartMsgStyle&&this.__state.prevChartMsgStyle.image,t=this.__state.currChartMsgStyle&&this.__state.currChartMsgStyle.image,a=this.__state.prevChartMsgStyle&&this.__state.prevChartMsgStyle.message,s=this.__state.currChartMsgStyle&&this.__state.currChartMsgStyle.message;return!!(e&&(e.imageHAlign!==t.imageHAlign||e.imageVAlign!==t.imageVAlign||e.imageAlpha!==t.imageAlpha||e.imageScale!==t.imageScale||a.color!==s.color||a.fontFamily!==s.fontFamily||a.fontSize!==s.fontSize))&&(this.__state.prevChartMsg=this.__state.currChartMsg,this.__state.prevChartMsgStyle=this.__state.currChartMsgStyle,!0)}_sudoSetState(e){this.__state.prevState=this.__state.state,this.__state.state=e,triggerEvent('stateChanged',this,{prevState:stateListOnPriority[this.__state.prevState],state:stateListOnPriority[this.__state.state]},[this.id])}_getState(){return stateListOnPriority[this.__state.state]}_addChartDependency(e,t){this._deps[e]&&this._removeChartDependency(e),this._deps[e]=t,t.getState=getStateForDep,t.getMsg=getMsgForDep,t.getMsgStyle=getMsgStyleForDep,Object.assign(t,t.resolve(t.scopeOf))}_removeChartDependency(e){this._deps[e]&&(this._deps[e].removed=!0,delete this._deps[e])}_parsePolicies(e){let t,a,s,r=this.args;for(t in e)if(globalPolicies[t]instanceof Array)a=r[e[t][0]],this[t]='undefined'==typeof a?e[t][1]:a;else for(s in'object'!=typeof this[t]&&(this[t]={}),e[t])a=r[e[t][s][0]],this[t][s]='undefined'==typeof a?e[t][s][1]:a}hasRendered(){return!!(this.jsVars.hcObj&&this.jsVars.hcObj.hasRendered)}setTransparent(e){var t;(t=this.jsVars)&&('boolean'!=typeof e&&null!==e&&(e=!0),t.transparent=null!==e&&!0===e)}addEventListener(e,t){return addListener(e,t,this)}on(e,t){return this.addEventListener(e,t)}removeEventListener(e,t){return removeListener(e,t,this)}formatNumber(e,t,a,s){let r,n,i,o,d,l,g=this,p=g.apiInstance||{},c=p.numberFormatter;switch(i=objToHash(a),a=a&&objToLowerCase(a)||{},''===i?c?d=c:(r=g.options.dataSource,n=r.chart||{},o=objToHash(n),NFStore[o]?d=NFStore[o]:NFStore[o]=d=new NumberFormatter(p,n)):(r=g.options.dataSource,n=r.chart||{},n=extend2(extend2({},n),a),o=objToHash(n),NFStore[o]?d=NFStore[o]:NFStore[o]=d=new NumberFormatter(p,n)),(t&&t.toLowerCase?t:'').toLowerCase()){case'yaxisvalues':l=d.yAxis(e,s);break;case'xaxisvalues':l=d.xAxis(e);break;case'scale':l=d.scale(e);break;default:l=d.dataLabels(e,s);}return l}clone(e,t){let a=typeof e,s={},r=extend2({},this.args,!1,!0);return deconstructPolicySet(globalPolicies,r,this),delete r.id,delete r.animate,delete r.stallLoad,s.link=r.link,r=extend2({},r,!1,!0),r.link=s.link,('object'==a?extend2(r,e,!1,!0):'boolean'==a?t=e:void 0,t?r:new FusionCharts(r))}isActive(){if(!this.ref||window.document.getElementById(this.id)!==this.ref)return!1;try{return SIGNATURE_MATCH_RE.test('FusionCharts')}catch(t){return!1}}chartType(e,t){let a,s=this,r=s.options;if('string'==typeof e&&''!==e){if(t='object'==typeof t?t:{},a=e.replace(/[\?\#][\s\S]*$/g,''),r.chartType=a.replace(/^[\s\S]*\//gi,''),r.chartTypeSourcePath=-1===a.indexOf('/')?t.chartTypeSourcePath||FusionCharts.options.chartTypeSourcePath||'':a.replace(/[^\/]*?$/gi,''),'zoomscatter'===r.chartType&&!document.createElement('canvas').getContext){let{msgStyle:e,msg:t}=showUnsupportedBrowserMessage(s);return this._addChartDependency('chartModuleLoad',{scopeOf:this,opts:{value:r.chartType},resolve:()=>({state:1,msgStyle:e,msg:t})}),void this._setState()}if('timeseries'===r.chartType&&isIE){let{msgStyle:e,msg:t}=showUnsupportedBrowserMessage(s);return this._addChartDependency('chartModuleLoad',{scopeOf:this,opts:{value:r.chartType},resolve:()=>({state:1,msgStyle:e,msg:t})}),void this._setState()}triggerEvent('resourceRequested',s),this._addChartDependency('chartModuleLoad',{scopeOf:this,opts:{value:r.chartType},resolve:handleChartModuleLoading}),'undefined'!=typeof t.dataSource&&null!==t.dataSource&&this.setChartData(t.dataSource,t.dataFormat,t.dataConfiguration),this._setState()}else if(void 0!==e){let{msgStyle:e,msg:t}=showUnsupportedChartMessage(this);return this._addChartDependency('chartModuleLoad',{resolve:()=>({state:1,msgStyle:e,msg:t})}),this._setState(),void triggerEvent('charttypeinvalid',this,{},[this.id])}return(r.chartType||'').toLowerCase()}setChartDataUrl(e='',t,a,s,r){this._addChartDependency('data',{scopeOf:this,opts:{url:e,format:t,config:a,callback:s,silent:r},resolve:_setChartDataUrl}),this._setState()}setChartData(e,t,a,s,r=!0){let n,i=this,o=i.options;if(!('undefined'!=typeof e&&null!==e))t=NATIVE_FORMAT;else if('string'!=typeof t)switch(typeof e){case'function':e=e.call(i,o.dataConfiguration),t=i.args.dataFormat='JSON';break;case'string':t=i.args.dataFormat=/^\s*?\{[\s\S]*\}\s*?$/g.test(t)?'JSON':'XML';break;case'object':t=i.args.dataFormat='JSON';}n=sanitiseFormatStr(t),URL_RE.test(n)?i.setChartDataUrl(e,n,a,s,r):(this._addChartDependency('data',{opts:{data:e,sanitisedFormat:n,config:a,callback:s,silent:r},scopeOf:i,resolve:_setChartData}),!i.disposed&&this._setState())}getChartData(e=NATIVE_FORMAT,t,a){var s,r,n=this,i=getDepsByType('transcoder'),o=sanitiseFormatStr(e),d=i[o](),l=n.options,g=n.apiInstance,p=!a&&(s=g&&g.getCollatedData&&g.getCollatedData(l.dataSource))?s:l.dataSource;return r=d?d.fromJSON?d.fromJSON(p,n):{error:new Error('Unable to convert data.')}:{error:new Error('Data format not recognized.')},!r.error&&l.error&&(r.error=l.error),t?r:r.data}dataReady(e){return e?this.__state.dataAvailable:this.__state.dataReady}setChartAttribute(e,t){var a,s,r,n,o;if('string'==typeof e)n=arguments[0],e={},e[n]=t;else if(null===e||'object'!=typeof e)return;if(o=0,a=this.getChartData(NATIVE_FORMAT),r=a&&(a.chart||a.graph||a.map),!r)return void raiseError(this,'2105141421','run','#setChartAttribute()','Could not retrieve attribute list. Is data ready?');for(s in e){if(o+=1,null===e[s]){delete r[s.toLowerCase()];continue}r[s.toLowerCase()]=e[s]}0<o&&('undefined'==typeof r.animation&&(r.animation='0'),this.setChartData(a,NATIVE_FORMAT))}getChartAttribute(e){var t,a,s=this.getChartData(NATIVE_FORMAT),r=s&&(s.chart||s.graph||s.map);if(0===arguments.length||'undefined'==typeof e||'undefined'==typeof r)return r;if('string'==typeof e)t=r[e.toString().toLowerCase()];else if(e instanceof Array)for(t={},a=0;a<e.length;a+=1)t[e[a]]=r[e[a].toString().toLowerCase()];else raiseError(this,'25081429','param','~getChartAttribute()','Unexpected value of "attribute"');return t}render(e,t,a){return this.disposed||(this.__state.beforeRenderFired=!1,this._addChartDependency('chartContainer',{scopeOf:this,opts:{containerElement:e,insertMode:t,callback:a},resolve:handleRender}),this.__state.renderInvoked=!0),this._setState(),this}_renderChart(e,t,a,s,r,n=!1){if(!this.disposed){var i,o=this,d=function(){!0===o.disposed||o._render(e,t,a&&function(){if(a)try{a.call(o,o.options.containerElement)}catch(t){setTimeout(function(){throw t})}},s,r)};return n||this.__state.beforeRenderFired?d():(this.__state.beforeRenderFired=!0,triggerEvent('beforeRender',this,i={container:o.options.containerElement,width:this.width,height:this.height,renderer:this.options.renderer},void 0,d,function(){triggerEvent('renderCancelled',o,i),this.__state.renderInvoked=!1})),this}}_render(e,t,a,s,r){var n=this;n.apiInstance&&n.apiInstance.removeJob('resizeScheduled'),n.__state.beforedrawFired?(createChart(FusionCharts,n,e,t,a,s,r),n.__state.beforedrawFired=!0):triggerEvent('beforedraw',n,{},void 0,function(){createChart(FusionCharts,n,e,t,a,s,r)},function(){triggerEvent('drawCancelled',n)})}resizeTo(e,t,a){var s=this,r=s.width,n=s.height,i=s.__state,o=s.apiInstance&&s.apiInstance.config||{};return o.resize=!0,'object'==typeof e&&(a=t,t=e.h,e=e.w),e=null===e||'undefined'==typeof e?r:e.toString().replace(LENGTH_CLEANUP_RE,''),t=null===t||'undefined'==typeof t?n:t.toString().replace(LENGTH_CLEANUP_RE,''),!0!==a&&triggerEvent('beforeresize',s,{currentWidth:r,currentHeight:n,newWidth:e,newHeight:t},void 0,function(){s.width=e,s.height=t,s.scheduleResize({width:e,height:t}),s.apiInstance&&s.apiInstance.addJob(`resized${count++}`,function(){triggerEvent('resized',s,{id:s.id,width:s.width,height:s.height,prevWidth:r,prevHeight:n,pixelWidth:s.ref&&s.ref.offsetWidth||0,pixelHeight:s.ref&&s.ref.offsetHeight||0,originalWidth:i.renderedWidth,originalHeight:i.renderedHeight})},priorityList.postRender)},function(){triggerEvent('resizecancelled',s,{currentWidth:r,currentHeight:n,cancelledTargetWidth:e,cancelledTargetHeight:t})}),this}dispose(){var e=this,t={};triggerEvent('beforeDispose',e,t,void 0,function(){e._addChartDependency('dispose',{scopeOf:e,resolve:e=>{for(var a in e._dispose(),e._addChartDependency('dispose',{resolve:()=>({state:0})}),e._setState(),triggerEvent('disposed',e,t),disposeEvents(e),delete FusionCharts.items[e.id],e)e.hasOwnProperty(a)&&delete e[a];return e.disposed=!0,{state:0}}})},function(){triggerEvent('disposeCancelled',e,t)})}_dispose(){var e,t=this,a=t.jsVars;t.apiInstance&&(t.apiInstance.removeJob('resizeScheduled'),t.apiInstance.remove({instant:!0}),delete t.apiInstance,delete a.instanceAPI),(e=window[t.id])&&(purgeDOM(e),e.parentNode&&e.parentNode.removeChild(e)),a.container=null}_config(e,t){var a,s,r=this,n=r.jsVars,i=n.msgStore,o=n.cfgStore,d=r.options;for(a in s={LoadingText:'loadMessage',ChartNotSupported:'typeNotSupportedMessage',RenderChartErrorText:'renderErrorMessage',XMLLoadingText:'dataLoadStartMessage',ChartNoDataText:'dataEmptyMessage',LoadDataErrorText:'dataLoadErrorMessage',InvalidXMLText:'dataInvalidMessage'},'string'==typeof e&&1<arguments.length&&(a=e,e={},e[a]=t),e)'undefined'==typeof i[a]?o[a.toLowerCase()]=e[a]:i[a]=e[a],s[a]?d[s[a]]=e[a]:d[a]=e[a]}configure(e,t){var a;e&&('string'==typeof e?(a={},a[e]=t):a=e,this._config(a))}print(e){var t=this.apiInstance,a=extend2({},e);return!t.config.isPrinting&&t.config.hasRendered&&void triggerEvent('BeforePrint',this,a,void 0,function(){var e,s,r,n,o,d=t.getFromEnv('chart-container'),l=[],g=d.parentNode,p=document.body||document.getElementsByTagName('body')[0],c=p.childNodes;if(t.config.isPrinting=!0,fcEach(c,function(e,t){1===e.nodeType&&(l[t]=e.style.display,e.style.display='NONE')}),!1!==a.hideButtons&&(o=t.getChildren('chartMenuBar'),o))for(s=o[0].getChildren('tool'),n=0,e=s.length;n<e;n++)s[0].getChildren('listContainer')[0].hide();p.appendChild(d),window.print(),setTimeout(function(){r&&(r.config.container.style.display='visible'),g.appendChild(d),fcEach(c,function(e,t){1===e.nodeType&&(e.style.display=l[t])}),!1!==a.hideButtons&&r&&(r.config.container.style.display='visible'),t.config.isPrinting=!1,triggerEvent('PrintComplete',t.getFromEnv('chartInstance'),a)},1e3)},function(){triggerEvent('PrintCancelled',t.getFromEnv('chartInstance'),a)})}getSVGString(e,t){var a,s=this,r=s.apiInstance,n=r&&r.getFromEnv('paper');return t&&t.keepImages&&(a=!0),'function'==typeof e?void r.addJob('getSVG',function(){e(n&&n.toSVG&&n.toSVG(a))},priorityList.postRender):n&&n.toSVG?n.toSVG(a):'<svg></svg>'}lockResize(e){return'boolean'==typeof e?this.jsVars.resizeLocked=e:!!this.jsVars.resizeLocked}showChartMessage(e,t,a,s={}){let r=this,n=r.apiInstance,i=function(){r._showChartMessage(e,t,a,s)};return n&&('base'===n.getName()?r.addEventListener('renderComplete',i):i()),e}_showChartMessage(e,t,a,s={}){let r,n=this,i=n.jsVars,o=n.apiInstance,d=n.options,l=function(){t&&o&&o.config.hasRendered?(o._show&&o._show(),n.showMessage(e,r,a)):(o._hide&&o._hide(),o.setChartMessage(e,{_chartMessageStyle:r}),o.drawChartMessage())};return o._hideChartMessage(),'undefined'==typeof e?void n.hideChartMessage():void(r={fontFamily:pluck(s.font,d.baseChartMessageFont,'Verdana,sans'),fontSize:pluck(s.fontSize,d.baseChartMessageFontSize,10),color:pluck(s.color&&convertColor(s.color,s.alpha),d.baseChartMessageColor)},i.msgStore[e]&&(e=i.msgStore[e]),o.addJob('showMsg',l,priorityList.postRender))}_resize(){var e=this.jsVars,t=this.apiInstance,a=e.container;this.__state.resize=!0,t?(t.config.elScroll=!1,t.getFromEnv('animationManager').setAnimationState('resize'),t.addToEnv('chartWidth',a.offsetWidth),t.addToEnv('chartHeight',a.offsetHeight),this._addChartDependency('resize',{resolve:()=>({state:3})})):this._addChartDependency('resize',{resolve:()=>({state:1})}),this._setState(),this.__state.resize=!1}hideChartMessage(){var e=this,t=e.apiInstance;t._hideChartMessage(),t._show&&t._show()}showMessage(e='',t,a){var s,r,n,i=this.apiInstance,o=i.config,d=i.getFromEnv('paper'),l=i.getFromEnv('smartLabel'),g=i.getFromEnv('animationManager'),p=i.getGraphicalElement('messageText'),c=i.getGraphicalElement('messageVeil'),m=d.width,u=d.height;r=i.getChildContainer('messageGroup'),g.setAnimationState('showmessage'),s=g.setAnimation({el:r||'group',attr:{name:'messageGroup'},component:i,label:'group'}),s.show().toFront(),r||i.addChildContainer('messageGroup',s),c=g.setAnimation({el:c||'rect',attr:{x:0,y:0,width:m,height:u,fill:'rgba(0,0,0,0.2)',stroke:'none'},container:s,component:i,label:'rect'}),c.off('fc-click',s.hide),c.show().toFront().attr('cursor',a?POINTER:'default'),a&&c.on('fc-click',i._hideChartMessage,i),i.addGraphicalElement('messageVeil',c),l.setStyle(t),n=l.getSmartText(e,m-(o.marginRight||0)-(o.marginLeft||0),u-(o.marginTop||0)-(o.marginBotton||0)),p=g.setAnimation({el:p||'text',attr:{"font-size":t.fontSize,"font-family":t.fontFamily,fill:t.color,text:n.text,"line-height":14,x:m/2,y:u/2},container:s,component:i,label:'text'}),p.attr('cursor',a?POINTER:'default')[a?'click':'unclick'](i._hideChartMessage,i).show().toFront(),i.addGraphicalElement('messageText',p)}scheduleResize(e){var t,a=this,s=a.ref,r=a.apiInstance;s&&(a._addChartDependency('resize',{resolve:()=>({state:2})}),r.addJob('resizeScheduled',function(){t=normalizeCSSDimension(e.width,e.height,s),'undefined'!=typeof e.width&&(s.style.width=t.width),'undefined'!==e.height&&(s.style.height=t.height),a._resize()},priorityList.instant))}}FusionCharts.id='FusionCharts',FusionCharts.options={html5ScriptNameSuffix:'.js',html5ScriptNamePrefix:'fusioncharts.',export:{useCanvas:!1},scriptBaseUri:function(){var e=getScriptBaseUri(SCRIPT_NAME_RE);return'undefined'==typeof e?(raiseError(FusionCharts,'1603111624','run','>GenericRuntime~scriptBaseUri','Unable to locate FusionCharts script source location (URL).'),''):e}()},'undefined'!=typeof __webpack_public_path__&&(__webpack_public_path__=FusionCharts.getScriptBaseURI()),FusionCharts.version=FCS.split(/[\.\-]/g),FusionCharts.items={},setRootSender(FusionCharts),isReady=!1,'undefined'!=typeof IS_IE8_BUILD&&IS_IE8_BUILD&&!hasSVG&&FusionCharts.addDep({name:'vml',type:'dependency',extension:import('../../../fc-features/src/vml')}),vmlRenderer=FusionCharts.getDep('vml','dependency'),vmlRenderer?vmlRenderer.then?vmlRenderer.then(e=>{FusionCharts.addDep(e['default']),readyFusionCharts()})['catch'](()=>{raiseError(FusionCharts,'162162788','run','>RendererError~VMLRendererLoad','Unable to load FusionCharts VML renderer.')}):(FusionCharts.addDep(vmlRenderer),readyFusionCharts()):readyFusionCharts(),FusionCharts.addEventListener('dependencyAdded',function(t,e){if('maps'===e.type){let t={};t[e.name]=['fusioncharts.maps.js'],FusionCharts.getDep('dependency')||FusionCharts.addDep({name:'dependency',extension:t})}}),FusionCharts.addEventListener('initialized',slHandler),FusionCharts.addDep(FileStore),FusionCharts.addDep(RedRaphael),FusionCharts.addDep(ToolTipAdapter),FusionCharts.addDep(RedRaphaelSVG),FusionCharts.addDep(JSONTranscoder),FusionCharts.addDep(RedRaphaelExtensions),FusionCharts.addDep(BaseChart);export default FusionCharts;