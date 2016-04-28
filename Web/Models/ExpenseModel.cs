using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Web.Models
{
    public class ExpenseModel
    {
        [Key]
        [Display( AutoGenerateField = true)]
        public int Id { get; set; }
        [Display(Name = "Amount", Description = "Expense Amount")]
        public Double Amount { get; set; }
        public string Description { get; set; }
        public string Comment { get; set; }
        public DateTimeOffset Date { get; set; }
        public ApplicationUser User { get; set; }
    }


    public class ExpenseViewModel
    {
        [Key]
        [Display(AutoGenerateField = true)]
        public int Id { get; set; }
        [Display(Name = "Amount", Description = "Expense Amount")]
        [Required]
        public Double Amount { get; set; }
        public string Description { get; set; }
        public string Comment { get; set; }
        [Required]
        public DateTimeOffset Date { get; set; }
        public string UserName { get; set; }
    }
}