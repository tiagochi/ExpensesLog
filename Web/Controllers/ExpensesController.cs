using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using Web.Models;

namespace Web.Controllers
{

    [Authorize]
    public class ExpensesController : ApiController
    {
        private ApplicationDbContext db = new ApplicationDbContext();

        private ApplicationUserManager _userManager;
        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? Request.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

        // GET: api/Expenses
        public IQueryable<ExpenseViewModel> GetExpenses()
        {

            return GetExpenses("",-1,"",DateTime.Today.AddDays(-7), DateTime.Today.AddDays(1),"");
            

        }

        // GET: api/Expenses
        public IQueryable<ExpenseViewModel> GetExpenses(string AmountOperator, float Amount, string Description, DateTime startDate, DateTime endDate,string SearchUserId)
        {
            var user = UserManager.FindByName(User.Identity.Name);
            var userId = user.Id;
            bool isAdmin = UserManager.IsInRole(userId, "Admin");

            IQueryable<ExpenseModel> q = null;
            if (isAdmin)
            {
                q = (from c in db.Expenses.Include("User")
                         where (((SearchUserId == null || SearchUserId == "") || (c.User.Id == SearchUserId)))
                             && c.Date >= startDate
                             && c.Date <= endDate
                             && (Amount == -1 || ((AmountOperator == ">" && c.Amount > Amount)
                                                || (AmountOperator == "<" && c.Amount < Amount)))
                            && (Description == null || Description == "" || (c.Description.Contains(Description)))
                         select c);
            }
            else
            {
                q = (from c in db.Expenses.Include("User")
                         where (c.User.Id == userId )
                             && c.Date >= startDate
                             && c.Date <= endDate
                             && (Amount == -1 || ((AmountOperator == ">" && c.Amount > Amount)
                                                || (AmountOperator == "<" && c.Amount < Amount)))
                            && (Description == null || Description == "" || (c.Description.Contains(Description)))
                         select c);
            }

            
                     

            

            return (from c in q.ToList()
                    orderby c.Date 
                             select new ExpenseViewModel
                             {
                                 Amount = c.Amount,
                                 Date = c.Date,
                                 Id = c.Id,
                                 Description =  c.Description,
                                 Comment = c.Comment,
                                 UserName = (c.User!= null)?c.User.UserName:""
                             }).AsQueryable();

            

        }




        // GET: api/Expenses/5
        [HttpGet]
        [ResponseType(typeof(ExpenseModel))]
        public async Task<IHttpActionResult> GetExpensesModel(int id)
        {
            ExpenseModel expensesModel = await db.Expenses.FindAsync(id);
            if (expensesModel == null)
            {
                return NotFound();
            }

            return Ok(expensesModel);
        }

        // PUT: api/Expenses/5
        [HttpPut()]
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> Put(ExpenseViewModel expenseModel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!ExpenseModelExists(expenseModel.Id))
            {
                return NotFound();
            }
            ExpenseModel expense = (from e in db.Expenses.Include("User") 
                                    where e.Id == expenseModel.Id 
                                    select e).First() ;
    
            if (!User.IsInRole("Admin") && expense.User.Id != User.Identity.GetUserId())
            {
                return new System.Web.Http.Results.StatusCodeResult(HttpStatusCode.Forbidden, this);
            }

            expense.Date = expenseModel.Date;
            expense.Amount = expenseModel.Amount;
            expense.Description = expenseModel.Description;
            expense.Comment= expenseModel.Comment;

            db.Entry(expense).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                
                throw;
                
            }

            return Ok(expense);
        }

        // POST: api/Expenses
        [HttpPost()]
        [ResponseType(typeof(ExpenseModel))]
        public async Task<IHttpActionResult> Post(ExpenseViewModel expenseModel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

           if (expenseModel.UserName != User.Identity.Name && !User.IsInRole("Admin"))
           {
                return  new System.Web.Http.Results.StatusCodeResult(HttpStatusCode.Forbidden,this);
           }


           var user = db.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);
           if (expenseModel.UserName != "")
           {
               user = db.Users.FirstOrDefault(u => u.UserName == expenseModel.UserName);
           }

           if (user == null)
           {
               return BadRequest("Invalid user");
           }

            ExpenseModel m = new ExpenseModel()
            {
                Date = expenseModel.Date,
                User = user,
                Description = expenseModel.Description == null ? "" : expenseModel.Description,
                Comment = expenseModel.Comment== null ? "" : expenseModel.Comment,
                Amount = expenseModel.Amount,
                
            };

            db.Expenses.Add(m);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = m.Id }, m);
        }

        // DELETE: api/Expenses/5
        [HttpDelete()]
        [ResponseType(typeof(ExpenseModel))]
        public async Task<IHttpActionResult> Delete(int id)
        {
            ExpenseModel expense = (from e in db.Expenses.Include("User")
                                    where e.Id == id
                                    select e).First();
            if (expense == null)
            {
                return NotFound();
            }

            if (!User.IsInRole("Admin") && expense.User.Id != User.Identity.GetUserId())
            {
                return BadRequest("Not Authorized");
            }



            db.Expenses.Remove(expense);
            await db.SaveChangesAsync();

            return Ok(expense);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ExpenseModelExists(int id)
        {
            return db.Expenses.Count(e => e.Id == id) > 0;
        }
    }
}