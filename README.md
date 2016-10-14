# pReact + pjs template
pReact，不支持ie9(包括ie9）以下版本IE浏览器。模板文件扩展名为*.pjs。

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
				<div onClick="{{ this.divHandle }}">{{ a }} {{ $a }}</div>
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
//伪标签。repeat（循环）、if（如果）语法不能同名嵌套使用，repeat可以套if使用，反之不可。
{{ repeat }}
	<div>{{ id }}</div>
	{{ if (a > b) }}
		<div>1</div>
	{{ else if (a < b) }}
		<div>2</div>
	{{ else }}
		<div>3</div>
	{{ end if }}
{{ end repeat }}
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
