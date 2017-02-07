# pReact + pjs template
pReact，仅支持ios和android设备。模板文件扩展名为*.pjs。

未对ES6做处理，仅依靠浏览器自身支持。

样式支持less写法，需加特殊属性（具体请查看下面的说明）。

APP例子中提供了grunt的开发环境，并提供watch任务实时监控代码的变化。

引用：
```
<script src="preact.js"></script>
```
特有标签写法：
```
<script type="text/pReact"></script>
```
写法：
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
如果想将pReact.createClass存储并再次使用的话，可以用以下方法：
```
	//定义
	var a = pReact.createClass("a", {
		render: function(){
			return (
				...
			)
		}
	});

	...

	//再次引用
	pReact.Class["a"] && pReact.renderDom(
		<pReact.Class["a"] />,
		document.getElementById("main")
	);

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
onTouchStart onScroll onWheel onSwipe
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
toRem: 转换px为rem
hexToRgb: 16进制转rgb
rgbToHex: rgb转16进制
cssPrefix: css属性自动加前缀 -webkit- -o- -ms- -moz-
base64: 转换为base64数据
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
{{ 8888888888888888888 | passcard : 4 }} 后面的4不输入的话，默认为4
{{ usname | empty : null }}
{{ 20 | toRem : 25.88 }} 后面的数据是html的字体大小
{{ #efefef | hexToRgb }}
{{ rgb(0,0,0) | rgbToHex }}
{{ "backface-visibility:hidden" | cssPrefix }}
{{ text | base64 : "text" }} 或 {{ text | base64 : "html" }}
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
pjs模板，伪标签写法<?pjs ... ?>，如下：
```
//伪标签。for、if、switch语法不能同名嵌套使用，for可以套if\switch使用，反之不可。
<?pjs for (var i=0;i<data.length;i++) ?> 或 <?pjs for (var i=0;i<2;i++) ?>
	<div>{{ id }}</div>
	<?pjs if (a > b) ?>
		<div>1</div>
	<?pjs else if (a < b) ?>
		<div>2</div>
	<?pjs else ?>
		<div>3</div>
	<?pjs end if ?>
<?pjs end for ?>
//switch和if可以嵌套使用。
<?pjs switch ({{ index }}) ?>
	<?pjs case 0 ?>
		<?pjs if (a > b) ?>
			<div>1</div>
		<?pjs else if (a < b) ?>
			<div>2</div>
		<?pjs else ?>
			<div>3</div>
		<?pjs end if ?>
	<?pjs end case ?>
	<?pjs case 1 ?>
		<li id="{{ id }}">2</li>
	<?pjs end case ?>
	<?pjs case 2 ?>
		<li id="{{ id }}">3</li>
	<?pjs end case ?>
<?pjs end switch ?>

toRem 伪标签
<?pjs toRem(px, font-size) ?>

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
		<input type="text" name="name" placeholder="{{ nameValue }}" value="" p-valid="noEmpty" p-error="error" />
		<input type="password" name="password" placeholder="{{ passwordValue }}" value="" p-valid="noEmpty" p-error="error" />
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
pjs模板，支持LESS写法如下：
```
...
p-type是style标签的内容类型，p-path是less.js的文件全路径。
render: function(){
	return (
		...
		<style p-type="text/less" p-path="preact-less.js">
			.a{
				text-align:center;
				p{
					background:#000;
					color:#fff;
				}
			}
		</style>
		<div class="a">
			1
			<p>2</p>
		</div>
		...
	);
}
...
```
非pjs模板写法（app/nopjs.js）：
```
	var nopjs = pReact.createClass("nopjs", {
		render: function() {
			return '<span style="position:fixed;top:50%;left:0;z-index:100000;">{{ a }}</span>';
		}
	});
	pReact.renderDom(nopjs, {
		a: "nopjs test"
	}, document.body);

```
增加define模块开发：
```
define("name", ["pReact"], function(){
	pReact && pReact...;
});
```
grunt开发环境:
```
1）标签伪属性：
include 将标签中src属性对应的文件插入当前标签中，目前应用到pjs、css合并入html中。
如下：
<script include src="dist/index/index.pjs"></script>
<link include href="css/font.css">

base64  将文件base64数据化后赋值给当前标签属性，目前应用到img图片标签。
如下：
<img base64 src="img/shair1.png" alt="">

2）package.json中configs的说明：
"configs": {
	"concat": [{	//合并的文件配置
		"path":"../",	//目录
		"src": ["header-article", "main-article", "footer", "gotop"],	//文件
		"dest": "dist/article/article",		//输出
		"ext": ".pjs"	//扩展名
	}],
	"include": [{	//需要扫描并插入的文件配置
		"src": ["*.html"],	//需要扫描的文件类型
		"dest": "dist/"		//输出目录
	}]
}

```
