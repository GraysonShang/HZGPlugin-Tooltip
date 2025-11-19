using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace ForguncyPluginTemplate.Server
{
    internal class ForguncyPluginTemplateMiddleware
    {
        private readonly RequestDelegate _next;
        public ForguncyPluginTemplateMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if(context.Request.Path.Value == "/ForguncyPluginTemplateMiddleware")
            {
                context.Response.ContentType = "text/plain;charset=UTF-8";
                await context.Response.WriteAsync("自定义中间件测试成功");
                return;
            }
            await _next(context);
        }
    }
}
