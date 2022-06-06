const Koa = require('./lib/application');
// const Koa = require('koa');

let app = new Koa();


function sleep (){
	return new Promise((resolve,reject) => {
		setTimeout(() => {
			console.log('sleep 2 seconds');
			resolve()
		},2000)
	})
}



//2.中间件
//必须写async/await，否则异步逻辑可能出错
app.use(async (ctx,next) => {
	console.log(1);
	ctx.body = '1';
	await next()
	await next()
	console.log(2);
	ctx.body = '2';
})

app.use(async (ctx,next) => {
	ctx.body = '3';
	console.log(3);
	await sleep ();
	next()
	console.log(4);
	ctx.body = '4';
})

app.use((ctx,next) => {
	ctx.body = '5';
	console.log(5);
	next()
	console.log(6);
	ctx.body = '6';

})


app.on('error',(err) => {
	console.log(err)
})





//1.上下文
// app.use((ctx) => {
// 	//createserver原生的req
// 	// console.log(ctx.req.url)
// 	// console.log(ctx.request.req.url)

// 	//自己扩展的req
// 	// console.log(ctx.request.query)

// 	//返回值
// 	// ctx.body = 'hello'
// 	// ctx.response.body = 'ss'
// })


app.listen(3000,() => {
	console.log('listen on http://localhost:3000')
})