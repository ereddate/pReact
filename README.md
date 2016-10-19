# pReact + pjs template
pReact，仅支持ios和android设备。模板文件扩展名为*.pjs。

未对ES6做处理，仅依靠浏览器自身支持。

```
	(function(win){
		var newForm = pReact.createClass({
			handleSubmit: function(e){
				e.peventDefault();
				document.getElementById("test").onsubmit();
			},
			render: function(){
				var cQ = "提 交";
				return (
					<style>
						input,button{display:block;margin:10px 0;}
						.form{margin:10px auto;text-align: center;width:300px;}
						.submit_button{padding:5px;border:0;border-radius: 5px;}
					</style>
					<div class="form clearFx">
						<form id="test" action="" onSubmit="{{ this.handleSubmit }}">
							<input type="text" name="name" placeholder="{{ nameValue | capitalize }}" value="" />
							<input type="password" name="password" placeholder="{{ passwordValue }}" value="" />
							<button type="submit" class="submit_button">{{ $cQ }}</button>
						</form>
					</div>
				)
			}
		});
		pReact.renderDom(
			<newForm {nameValue: "帐号：请输入...", passwordValue:"密码：请输入..."} />,
			document.getElementById("main")
		);
	})(this)
```
或
```
	class testEs6{
		getInitData(success, error){
			pReact.jsonp("url").done(function(data){
				success(data);
			}, function(){
				error();
			});
		}
		divHandle(e){
			e.preventDefault();
			console.log("div click!");
		}
		render(){
			let a = "testEs6-a";
			return (
				<div onClick="{{ this.divHandle }}" p-hide>{{ a }} {{ $a }}</div>
				<button>no handle</button>
			)
		}
	}
	pReact.renderDom(
		<testEs6 />,
		document.getElementById("main")
	);
```
或
```
	pReact.ready(function(){
		this({
			path:"./",
			ext: ".js",
			files:["test-jq1","test-native1"]
		}).load("../libs/jquery.2.2.0.js").set({
			path:"./",
			ext: ".pjs",
			files:["test-native"]
		}).done();
	});
```
pjs模板，数据赋值方法如下：
```
正常情况：
数据 {a:1}
模板 {{ a }}

引用js中的数据：
数据 var a = 1;
模板 {{ $a }}

引用js中的方法，如标签加事件：
数据 },a:function(){...},{
模板 <a onClick = "{{ this.a }}" ...

事件支持如下：
onClick onCopy onCut onPaste onKeyDown onKeyPress onKeyUp onFocus onBlur onChange onInput onSubmit onTouchCancel onTouchEnd onTouchMove
onTouchStart onScroll onWheel
注：事件名在on后首字母应为大字。

伪类属性：
p-hide 隐藏
p-show 显示
```
pjs模板，伪类属性扩展写法如下：
```
pReact.tmplBindsExtend({
	name: function(elem, obj){
		...
	}
});
```
pjs模板, 数据过滤方法如下：
```
filter：内容过滤掉指定值
json：json转String
limitToCharacter：字数限制
limitTo：位数限制
lowercase：字符最小化
uppercase：字符最大化
orderBy：数据正序、倒序
date：日期格式转换
currency：货币转换
empty：为空时替代
passcard：卡号转换
indexOf: 取指定值在数组或字符串的位置
encodeURI: 转换为URI格式
decodeURI: 解码encodeURI后的代码
toString: 任务形式数据转换为字符串
capitalize: 某位数的英文字母的大写转换
toCNRMB: 转换为中文大写人民币
toCNumber: 转换为中文大写数字
```
pjs模板, 数据过滤写法如下：
```
{{ name | filter : 'a' }}
{{ {a:1,b:2} | json }}
{{ text | limitTo : 2 }}
{{ array | indexOf : "b" }}
{{ number | toCNRMB }}
{{ number | toCNumber }}
{{ abc | lowercase }}
{{ abc | uppercase }}
{{ 123 | orderBy : reverse }}
{{ 321 | orderBy : sort }}
{{ date | date : MM/dd/yyyy }}
{{ capitalize | capitalize : 2 }}
{{ capitalize | capitalize : 0 }}
{{ 1000 | currency : '$' }}
{{ 100000000000 | passcard }}
{{ usname | empty : null }}
```
pjs模板，数据过滤扩展写法如下：
```
pReact.tmplFilterExtend({
	name: function(val, filterCondition){
		...
		return val;
	}
});
```
pjs模板，伪标签写法如下：
```
//伪标签。for、if、switch语法不能同名嵌套使用，for可以套if\switch使用，反之不可。
{{ for (var i=0;i<data.length;i++) }} 或 {{ for (var i=0;i<2;i++) }}
	<div>{{ id }}</div>
	{{ if (a > b) }}
		<div>1</div>
	{{ else if (a < b) }}
		<div>2</div>
	{{ else }}
		<div>3</div>
	{{ end if }}
{{ end for }}
//switch和if可以嵌套使用。
{{ switch ({{ index }}) }}
	{{ case 0 }}
		{{ if (a > b) }}
			<div>1</div>
		{{ else if (a < b) }}
			<div>2</div>
		{{ else }}
			<div>3</div>
		{{ end if }}
	{{ end case }}
	{{ case 1 }}
		<li id="{{ id }}">2</li>
	{{ end case }}
	{{ case 2 }}
		<li id="{{ id }}">3</li>
	{{ end case }}
{{ end switch }}
```
pjs模板，伪标签扩展写法如下：
```
pReact.tmplLangExtend({
	name: function(html){
		...
		return html;
	}
});
```
pjs模板，伪类控件属性写法如下：
```
...
</style>
<div class="form clearFx" p-controller="formController">
	<form id="test" action="" method="post">
		<input type="text" name="name" placeholder="{{ nameValue }}" value="" p-valid="{{ noEmpty }}" p-error="{{ .error }}" />
		<input type="password" name="password" placeholder="{{ passwordValue }}" value="" p-valid="{{ noEmpty }}" p-error="{{ .error }}" />
		<button type="submit" class="submit_button" p-submit="{{ this.submitHandle }}">{{ $cQ }}</button>
	</form>
</div>
...
只需要标签的父级加入"p-controller"属性并赋值名称（此名称为“控件控制集”中对应的方法），并按要求给控制添加条件属性就可以实现相应的功能。
现提供控件如下：
1）formController验证控件。
使用方法：
在对应标签加入p-valid（验证条件，每个条件以“，”分隔）、p-error（错误样式）、p-submit（提交验证成功后的回调方法）就可以实现表单验证功能。写法如上例！

验证方法扩展写法如下：
pReact.tmplValidsExtend({
	name: function(elem, valid){
		...
		return true;
	}
}
```
pjs模板，伪类控件属性扩展写法如下：
```
pReact.tmplControlExtend({
	name: function(elem, obj){
		...
	}
});
```
