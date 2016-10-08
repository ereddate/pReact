# pReact
pReact，不支持ie9(包括ie9）以下版本IE浏览器。

未对ES6做处理，仅依靠浏览器自身支持。

```
<script src="preact.js"></script>
<script type="text/pReact">
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
							<input type="text" name="name" placeholder="{{ nameValue }}" value="" />
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
</script>
<script type="text/pReact">
	class testEs6{
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
		<testEs6 {a: "testEs6"} />,
		document.getElementById("main")
	);
</script>
```
或
```
<script>
	pReact({
		path:"./",
		ext: ".js",
		files:["test-jq1","test-native1"]
	}).load("../libs/jquery.2.2.0.js").load("preact-load.js").set({
		path:"./",
		ext: ".pjs",
		files:["test-jq","test-native"]
	}).done();
</script>
```
