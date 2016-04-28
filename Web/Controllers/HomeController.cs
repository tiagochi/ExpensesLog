using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using Web.Models;

namespace Web.Controllers
{
    public class HomeController : Controller
    {
        public async Task<ActionResult> Index()
        {
            ViewBag.Title = "Expenses";


            var userStore = new UserStore<ApplicationUser>(new ApplicationDbContext());
            var manager = new ApplicationUserManager(userStore);
            
            var user = await manager.FindByNameAsync(User.Identity.Name);
            //ViewBag.ExpensesPerDay = (user != null)? user.ExpensesPerDay: 0;
            return View();
        }
    }
}
