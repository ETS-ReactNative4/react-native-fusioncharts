import{pluckNumber,componentFactory}from'../../../../fc-core/src/lib';import ColorGradient from'../../../../fc-core/src/color-utils/color-bucket';function configureAttributes(){let a=this,b=a.getFromEnv('dataSource'),c=b.colorrange;c&&c.color&&c.color.length?(componentFactory(a,ColorGradient,'colorRange',1,[{colorRange:c,numberFormatter:a.getFromEnv('number-formatter')}]),a.addToEnv('colorRange',a.getChildren('colorRange')&&a.getChildren('colorRange')[0])):a.deleteFromEnv('colorRange')}function _getData(){var a,b,c=this,d=c.getDatasets();if(d&&(b=d[0].components.data,b&&b[0]))return a=b[0].config,pluckNumber(a.setValue,a.itemValue)}export{configureAttributes,_getData};