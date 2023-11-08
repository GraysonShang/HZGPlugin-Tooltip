using System;
using System.Collections.Generic;
using GrapeCity.Forguncy.ServerApi;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace Tooltip.Server
{
    public class TooltipMiddlewareInjector : MiddlewareInjector
    {
        public override List<ServiceItem> ConfigureServices(List<ServiceItem> serviceItems, IServiceCollection services)
        {
            serviceItems.Insert(0, new ServiceItem()
            {
                Id = "99f246ce-5d88-4df9-b003-d5e003368ffb",
                ConfigureServiceAction = () =>
                {
                    // 这里可以注册中间件需要的服务，相当于 Asp.net 中的 public void ConfigureServices(IServiceCollection services) 方法
                    //services.AddXXXService();
                },
                Description = "我的自定义中间件服务"
            });
            return base.ConfigureServices(serviceItems, services);
        }
        public override List<MiddlewareItem> Configure(List<MiddlewareItem> middlewareItems, IApplicationBuilder app)
        {
            middlewareItems.Insert(0, new MiddlewareItem()
            {
                Id = "99f246ce-5d88-4df9-b003-d5e003368ffb",
                ConfigureMiddleWareAction = () =>
                {
                    app.UseMiddleware<TooltipMiddleware>();
                },
                Description = "我的自定义中间件"
            });
            return base.Configure(middlewareItems, app);
        }
    }
}
