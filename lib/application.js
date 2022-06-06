
const http = require('http');
const context = require('./context');
const request = require('./request');
const response = require('./response');
const EventEmitter = require('events');


class Application extends EventEmitter{
	constructor(){
		super();
		this.context = Object.create(context);
		this.request = Object.create(request);
		this.response = Object.create(response);
		this.middlewares = [];
	}

	//2.注册中间件
	// use(fn) {
	// 	//只注册，具体处理在handleRequest
	// 	this.fn = fn;
	// }
	use(middleware) {
		this.middlewares.push(middleware);
	}

	compose(ctx){
		let index = -1;
		const dispatch = (i) => {
			//在同一个中间件中next()被多次调用
			if(index <= i){
				//抛出异常
				return Promise.reject('在同一个中间件中next()被多次调用')
			}
			index = i;
			//判断是否已经结束或者没有传中间件
			if(this.middlewares.length == i){
				return Promise.resolve();
			}
			//获得第i个中间件(也就是用户在app.use中传入的函数)
			let middleware = this.middlewares[i];

			//避免中间某个中间件不是promise，直接将其包装成promise
			//第二个参数值得就是next函数，它会调用第i+1个中间件
			try{
				return Promise.resolve(middleware(ctx,() => dispatch(i+1)));
			}catch(e){
				return Promise.reject(e)
			}
		}
		//初识时调用第一个中间件
		return dispatch(0);
	}

	//3.处理中间件
	//http模块自带req，res
	handleRequest = (req,res) => {
		//4.进一步封装req，res为ctx
		let ctx = this.createContext(req,res);
		res.statusCode = 404;

		//5.调用中间件
		this.compose(ctx).then(() => {
			// 返回结果
			let body = ctx.body
			if(body){
				res.end(body);
			}else{
				res.end('not found');
			}
		}).catch(e => {
			//处理异常，利用events的emit将事件发出
			this.emit('error',e);
		})
	}

	listen() {
		//1.创建服务器
		//异步：handleRequest
		let server = http.createServer(this.handleRequest);
		server.listen(...arguments);
	}

	//进一步封装req，res为ctx
	createContext(req,res) {
		//4.1 全局上下文
		let ctx = Object.create(this.context);
		//4.2 request相关
		let request = Object.create(this.request);
		//4.3 response相关
		let response = Object.create(this.response);

		ctx.request = request;//自己封装的request，在./request文件中
		ctx.request.req = ctx.req = req;//http.createServer创建时自带的req

		ctx.response = response;
		ctx.response.res = ctx.res = res;
		return ctx;
	}

}



module.exports = Application;