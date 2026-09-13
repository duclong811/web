using Microsoft.EntityFrameworkCore;
using WebCafe.Backend.Common.Helper;
using WebCafe.Backend.Infrastructure.Data;
using WebCafe.Backend.Models.Entities;

namespace WebCafe.Backend.Infrastructure.Seeder
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(WebCafeDbContext db)
        {
            // 1. Seed SuperAdmin
            if (!await db.SystemAdmins.AnyAsync())
            {
                db.SystemAdmins.Add(new SystemAdmin
                {
                    Username = "superadmin",
                    Email = "admin@webcafe.vn",
                    FullName = "Hệ thống WebCafe Master",
                    PasswordHash = SecurityHelper.HashPassword("Admin@123"),
                    IsActive = true
                });
                await db.SaveChangesAsync();
            }

            var tenant = await db.Tenants.FirstOrDefaultAsync();
            if (tenant == null)
            {
                tenant = new Tenant
                {
                    Name = "The Coffee House",
                    Slug = "the-coffee-house",
                    OwnerName = "Nguyễn Văn Chủ Quán",
                    OwnerPhone = "0901234567",
                    OwnerEmail = "owner@thecoffeehouse.vn",
                    OwnerPasswordHash = SecurityHelper.HashPassword("Owner@123"),
                    LogoUrl = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&q=80",
                    Plan = "premium",
                    MaxStores = 5,
                    PointsPerAmount = 10000,
                    PointsToMoney = 200,
                    IsActive = true
                };
                db.Tenants.Add(tenant);
                await db.SaveChangesAsync();
            }

            // 2. Ensure Stores
            var store1 = await db.Stores.FirstOrDefaultAsync(s => s.TenantId == tenant.TenantId);
            if (store1 == null)
            {
                store1 = new Store
                {
                    TenantId = tenant.TenantId,
                    Name = "The Coffee House - Quận 1",
                    Address = "86-88 Cao Thắng, Phường 4, Quận 3, TP.HCM",
                    Phone = "02871087088",
                    BankAccount = "090123456789",
                    BankName = "MBBank",
                    BankAccountName = "THE COFFEE HOUSE Q1",
                    IsActive = true
                };
                db.Stores.Add(store1);
                await db.SaveChangesAsync();
            }

            // 3. Ensure Staff
            var staffRole = await db.Roles.FirstOrDefaultAsync(r => r.TenantId == tenant.TenantId && r.Name == "Staff");
            if (staffRole == null)
            {
                staffRole = new Role { TenantId = tenant.TenantId, Name = "Staff", Description = "Nhân viên phục vụ / Thu ngân" };
                db.Roles.Add(staffRole);
                await db.SaveChangesAsync();
            }

            if (!await db.Staff.AnyAsync(s => s.StoreId == store1.StoreId))
            {
                db.Staff.Add(new Staff
                {
                    StoreId = store1.StoreId,
                    RoleId = staffRole.RoleId,
                    Username = "staff_q1",
                    FullName = "Lê Phục Vụ",
                    Phone = "0923456789",
                    Email = "staff.q1@thecoffeehouse.vn",
                    PasswordHash = SecurityHelper.HashPassword("Staff@123"),
                    IsActive = true
                });
                await db.SaveChangesAsync();
            }

            // 4. Ensure Full Categories & MenuItems
            var itemCount = await db.MenuItems.CountAsync(m => m.TenantId == tenant.TenantId);
            if (itemCount < 10)
            {
                // Remove old items to re-seed rich menu cleanly
                var oldToppingLinks = await db.MenuItemToppings.ToListAsync();
                db.MenuItemToppings.RemoveRange(oldToppingLinks);
                var oldSizeLinks = await db.MenuItemSizes.ToListAsync();
                db.MenuItemSizes.RemoveRange(oldSizeLinks);
                var oldItems = await db.MenuItems.ToListAsync();
                db.MenuItems.RemoveRange(oldItems);
                var oldCats = await db.Categories.ToListAsync();
                db.Categories.RemoveRange(oldCats);
                await db.SaveChangesAsync();

                // Categories
                var catCoffee = new Category { TenantId = tenant.TenantId, Name = "Cà Phê Pha Máy", Icon = "coffee", SortOrder = 1, IsActive = true };
                var catTea = new Category { TenantId = tenant.TenantId, Name = "Trà & Trái Cây", Icon = "energy_savings_leaf", SortOrder = 2, IsActive = true };
                var catMilkTea = new Category { TenantId = tenant.TenantId, Name = "Sinh Tố & Trà Sữa", Icon = "bubble_chart", SortOrder = 3, IsActive = true };
                var catCake = new Category { TenantId = tenant.TenantId, Name = "Bánh Ngọt", Icon = "bakery_dining", SortOrder = 4, IsActive = true };
                var catGift = new Category { TenantId = tenant.TenantId, Name = "Quà Lưu Niệm", Icon = "local_mall", SortOrder = 5, IsActive = true };
                db.Categories.AddRange(catCoffee, catTea, catMilkTea, catCake, catGift);
                await db.SaveChangesAsync();

                // Sizes
                var sizeM = await db.Sizes.FirstOrDefaultAsync(s => s.TenantId == tenant.TenantId && s.Name == "Medium");
                if (sizeM == null)
                {
                    sizeM = new Size { TenantId = tenant.TenantId, Name = "Medium", SortOrder = 1 };
                    db.Sizes.Add(sizeM);
                }
                var sizeL = await db.Sizes.FirstOrDefaultAsync(s => s.TenantId == tenant.TenantId && s.Name == "Large");
                if (sizeL == null)
                {
                    sizeL = new Size { TenantId = tenant.TenantId, Name = "Large", SortOrder = 2 };
                    db.Sizes.Add(sizeL);
                }
                await db.SaveChangesAsync();

                // Toppings
                var topBoba = await db.Toppings.FirstOrDefaultAsync(t => t.TenantId == tenant.TenantId && t.Name == "Trân châu hoàng kim");
                if (topBoba == null)
                {
                    topBoba = new Topping { TenantId = tenant.TenantId, Name = "Trân châu hoàng kim", Price = 10000, IsAvailable = true };
                    db.Toppings.Add(topBoba);
                }
                var topWhiteBoba = await db.Toppings.FirstOrDefaultAsync(t => t.TenantId == tenant.TenantId && t.Name == "Trân châu trắng");
                if (topWhiteBoba == null)
                {
                    topWhiteBoba = new Topping { TenantId = tenant.TenantId, Name = "Trân châu trắng", Price = 10000, IsAvailable = true };
                    db.Toppings.Add(topWhiteBoba);
                }
                var topPudding = await db.Toppings.FirstOrDefaultAsync(t => t.TenantId == tenant.TenantId && t.Name == "Pudding trứng");
                if (topPudding == null)
                {
                    topPudding = new Topping { TenantId = tenant.TenantId, Name = "Pudding trứng", Price = 10000, IsAvailable = true };
                    db.Toppings.Add(topPudding);
                }
                var topCheese = await db.Toppings.FirstOrDefaultAsync(t => t.TenantId == tenant.TenantId && t.Name == "Kem phô mai Macchiato");
                if (topCheese == null)
                {
                    topCheese = new Topping { TenantId = tenant.TenantId, Name = "Kem phô mai Macchiato", Price = 15000, IsAvailable = true };
                    db.Toppings.Add(topCheese);
                }
                await db.SaveChangesAsync();

                // 25+ Menu Items
                var menuItems = new List<MenuItem>
                {
                    // Cà Phê Pha Máy
                    new MenuItem {
                        TenantId = tenant.TenantId, CategoryId = catCoffee.CategoryId,
                        Name = "Caramel Cloud Macchiato", BasePrice = 57500, Rating = 4.8m,
                        Description = "Lớp bọt sữa lạnh mềm mịn phủ trên lớp espresso cùng hương vani và xốt caramel.",
                        ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAb7dmU9p5ws6yiGWFQpEh-Vjo0PCA4sYcpCjINzCM3Te0tnsc9ffhxbMqhXwS7_UeEMCLtBftnxvaW-r--YOlDyGw_cqWmfbTrTi9x04jt5jvNm1zWxdQmgdxk0COUycCP_X3lzDPhldmC8jF2emQxsl_LjSU_wRlGYcAvL9KlYEpvc75GxsLaJyeJWoZdR3CyjB-3uLAfxuL5A33XycLc9p5gssh1z_k2p2uFU0nfU_ylV5jeljNf",
                        IsFeatured = true, IsAvailable = true, SortOrder = 1
                    },
                    new MenuItem {
                        TenantId = tenant.TenantId, CategoryId = catCoffee.CategoryId,
                        Name = "Nitro Velvet Brew", BasePrice = 49500, Rating = 4.9m,
                        Description = "Ủ lạnh 20 tiếng và kết hợp với khí nitơ để tạo nên kết cấu siêu mịn, béo ngậy.",
                        ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuBm3z4t9Q_erviq8V0f_xE0Kk5WKh-Gyct1TiA-sfVsueTSn9wSDN91lNfpzBCEoZlsVIuL3-LtwaoH9xfm45EfTaOmgDo4FaKA5jK8oGYyU6HEHjs7K0nh6zdw6ro5mjYFK6MgUBSb0y_0wBgcGekJdVZoFeYmxiJSH5tr9HHd0DXye5CvJ42Q2FvTvGyLN2dv5uxi4xC0LKNZUzwpe6JnCPG2J1N0h7RFNvSaw5ksNL1inKMpmiWc",
                        IsFeatured = true, IsAvailable = true, SortOrder = 2
                    },
                    new MenuItem {
                        TenantId = tenant.TenantId, CategoryId = catCoffee.CategoryId,
                        Name = "Classic Flat White", BasePrice = 45000, Rating = 4.6m,
                        Description = "Hai shot espresso được chiết xuất hoàn hảo với lớp bọt sữa mỏng và siêu mịn.",
                        ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuBnqJ2oXSFRtA0ryNB9aaYC2CyYGG_EVliGTodIT1ko3_4mwED6o3WhSyDUz4gFfHFuXMNcoZ8Ut3AdaYz2rooQIo8a5uU97WxsHKJPIgsWl1yZGv95X4meMJFTe0sY7VwXaEq69fFdtp0MBmW6Kuc42C4s1ELHt2s6-0v00VxRQ_-FfuBDTGLzpnwsa5BYYv00jS6frOt4pl4orUPlb8MunpQEEBTHVkKeL6_zDRRzsXfu8AleqBlc",
                        IsFeatured = false, IsAvailable = true, SortOrder = 3
                    },
                    new MenuItem {
                        TenantId = tenant.TenantId, CategoryId = catCoffee.CategoryId,
                        Name = "Winter Peppermint Mocha", BasePrice = 59500, Rating = 4.9m,
                        Description = "Espresso đậm đà kết hợp với sô-cô-la đắng, si-rô bạc hà và kem tươi.",
                        ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuC9-1leTygB-ItPyqGSVsiUhHGiA0NO8LiAGMH2RaXxZjF_IkvbelPHagclH3hVM2HQ2Kn77b6uoFQ1fWeBvLRhSab5mEXwEQc1Y119gPPQcjbejtNiF1ullU-5lJlzdHbqU6ZZtuSuba_yHqQ9aaWdzG6OWcldnuEy6Z3vbf3T0sL62dOocyli4ykfmAWeuF-xo4M_bxsFiR8J1wod-116FEzUjJC6ETgo01I3cf0ZNLQC3TY7tP1Z",
                        IsFeatured = true, IsAvailable = true, SortOrder = 4
                    },
                    new MenuItem {
                        TenantId = tenant.TenantId, CategoryId = catCoffee.CategoryId,
                        Name = "Hazelnut Praline Latte", BasePrice = 52500, Rating = 4.7m,
                        Description = "Espresso êm dịu và sữa hấp kết hợp với si-rô hạt phỉ ngọt ngào.",
                        ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuBm3z4t9Q_erviq8V0f_xE0Kk5WKh-Gyct1TiA-sfVsueTSn9wSDN91lNfpzBCEoZlsVIuL3-LtwaoH9xfm45EfTaOmgDo4FaKA5jK8oGYyU6HEHjs7K0nh6zdw6ro5mjYFK6MgUBSb0y_0wBgcGekJdVZoFeYmxiJSH5tr9HHd0DXye5CvJ42Q2FvTvGyLN2dv5uxi4xC0LKNZUzwpe6JnCPG2J1N0h7RFNvSaw5ksNL1inKMpmiWc",
                        IsFeatured = false, IsAvailable = true, SortOrder = 5
                    },
                    new MenuItem {
                        TenantId = tenant.TenantId, CategoryId = catCoffee.CategoryId,
                        Name = "Dark Mocha Truffle", BasePrice = 55000, Rating = 4.8m,
                        Description = "Sô-cô-la đen nguyên chất hòa quyện cùng hai shot espresso và sữa mịn.",
                        ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuA1nN9BTg-bC-pjrTGkRvaJWBxgKbWIAaR19jPp0ddKGdTTVdzfib0wdsrk23ebzDYxwoZcha4uRik6TbQ0GX2OoCQvvlsGJaKrQreIR3IKjlJQ0pOX5UNQSBLMk5UcMQV9VsTAj68ooujXqRf_tRW22Rtv7lJKmnZR-8aa9UV9TWDDv9jJFW-3BwjZ4tWd9OZ35khknKXqgZfYBWvgOLxtkr3yvVlNZUuzU0Hwxk6cciuL4Yn_rdIH",
                        IsFeatured = true, IsAvailable = true, SortOrder = 6
                    },

                    // Trà & Trái Cây
                    new MenuItem {
                        TenantId = tenant.TenantId, CategoryId = catTea.CategoryId,
                        Name = "Ceremonial Matcha Latte", BasePrice = 52500, Rating = 4.7m,
                        Description = "Matcha nguyên chất được nghiền mịn pha cùng loại sữa tùy chọn để tăng cường sự tập trung.",
                        ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAJZyz4PNbdQQw05cZ4yPa11jXqJ-4RPVBwhgDTkCdAccQCJu23SzuePGANtTU7T926eOcygde9PJ-hwAIbbbA5AI7Ch2nWhGJYkk6fRNAPvJkc8WhLpnukQsDDcFoMRlX-EMC8XfXvrZFz7456k_jX_tqSYdZhDmCJjtVemUiQPdxC1YTGFuE5462f7abqrGcILDvTRgzsjT6eqRcqpY2heJtFteEYZXrg2b6nUJXuV8yBdVVong1S",
                        IsFeatured = true, IsAvailable = true, SortOrder = 7
                    },
                    new MenuItem {
                        TenantId = tenant.TenantId, CategoryId = catTea.CategoryId,
                        Name = "Iced Hibiscus Zen", BasePrice = 42500, Rating = 4.5m,
                        Description = "Hồng trà dâm bụt lắc tay với một chút hương chanh và vị ngọt dịu.",
                        ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDsmg5WwGwQ6ZasKowi4EwiJgCRPnrou_8vsk79EXcOjHd2M_fntLBJlM2QBSg97zXHwKapV8b7EvTBvBErsIVCmSNZ56sdmJKzVPtqP7KpKjdm0-39q4Bqh6GfzGp6_w7kSk4X6ifzCJeFiNrrD-D4hLPEdGQJJcM9tsu6GcALjNz7wOwz9CfqMbeGKqRqlY0oyZiI6q1gsT6N7o1G4zBbhdgGG7Tz9pF2PDLNDsEcfkAEPX-p57av",
                        IsFeatured = false, IsAvailable = true, SortOrder = 8
                    },
                    new MenuItem {
                        TenantId = tenant.TenantId, CategoryId = catTea.CategoryId,
                        Name = "Honey Chamomile Dream", BasePrice = 45000, Rating = 4.9m,
                        Description = "Trà thảo mộc thư giãn từ hoa cúc nguyên bông pha chút mật ong cỏ dại hữu cơ.",
                        ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuB2nN9BTg-bC-pjrTGkRvaJWBxgKbWIAaR19jPp0ddKGdTTVdzfib0wdsrk23ebzDYxwoZcha4uRik6TbQ0GX2OoCQvvlsGJaKrQreIR3IKjlJQ0pOX5UNQSBLMk5UcMQV9VsTAj68ooujXqRf_tRW22Rtv7lJKmnZR-8aa9UV9TWDDv9jJFW-3BwjZ4tWd9OZ35khknKXqgZfYBWvgOLxtkr3yvVlNZUuzU0Hwxk6cciuL4Yn_rdIH",
                        IsFeatured = true, IsAvailable = true, SortOrder = 9
                    },

                    // Sinh Tố & Trà Sữa
                    new MenuItem {
                        TenantId = tenant.TenantId, CategoryId = catMilkTea.CategoryId,
                        Name = "Oolong Milk Tea", BasePrice = 48500, Rating = 4.8m,
                        Description = "Trà Oolong nướng thượng hạng kết hợp cùng sữa béo thơm nồng nàn và trân châu dẻo dai.",
                        ImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCKd6TB68l0dgvWLbBxZzmjvDZZZ_cMU4ok5MEOMER0SqvsbIR_nTB6LVT6KeYzL8siPAiiRYfcYqe09wQyWL95hdMlh1AfQJZRfWGfAqDJ7tRa5zFALx4h9trbOeMQ606u34IaPz5suzCjWu63v8yMrVSH5a_N9oGzS8XsrITZ2v-yg_2T_sFH0KVRu6ZEh1okmdJea_sxDSGMHr0U5XZlYvh8y2rRcDZXBFL0lQFP66vs7u-qb2lZ",
                        IsFeatured = true, IsAvailable = true, SortOrder = 10
                    },
                    new MenuItem {
                        TenantId = tenant.TenantId, CategoryId = catMilkTea.CategoryId,
                        Name = "Jasmine Dragon Pearl", BasePrice = 52000, Rating = 4.9m,
                        Description = "Hương hoa lài thanh khiết hòa quyện cùng cốt trà sữa ngậy và trân châu hoàng kim.",
                        ImageUrl = "https://images.unsplash.com/photo-1558857563-b37cfb42bfae?w=500&q=80",
                        IsFeatured = true, IsAvailable = true, SortOrder = 11
                    },
                    new MenuItem {
                        TenantId = tenant.TenantId, CategoryId = catMilkTea.CategoryId,
                        Name = "Mango Passion Bliss", BasePrice = 55000, Rating = 4.7m,
                        Description = "Sinh tố xoài cát chín cây thơm lừng kết hợp cùng chanh dây tươi mát giải nhiệt tức thì.",
                        ImageUrl = "https://images.unsplash.com/photo-1546173159-315724a31696?w=500&q=80",
                        IsFeatured = false, IsAvailable = true, SortOrder = 12
                    },

                    // Bánh Ngọt
                    new MenuItem {
                        TenantId = tenant.TenantId, CategoryId = catCake.CategoryId,
                        Name = "Dark Chocolate Truffle Tart", BasePrice = 55000, Rating = 4.9m,
                        Description = "Đế bánh quy giòn tan phủ đầy ganache sô-cô-la đen 70% Bỉ đậm đà quý phái.",
                        ImageUrl = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80",
                        IsFeatured = true, IsAvailable = true, SortOrder = 13
                    },
                    new MenuItem {
                        TenantId = tenant.TenantId, CategoryId = catCake.CategoryId,
                        Name = "Basque Burnt Cheesecake", BasePrice = 60000, Rating = 4.9m,
                        Description = "Bánh phô mai nướng cháy xém bề mặt độc đáo, mềm mịn béo ngậy tan ngay trong miệng.",
                        ImageUrl = "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80",
                        IsFeatured = true, IsAvailable = true, SortOrder = 14
                    },
                    new MenuItem {
                        TenantId = tenant.TenantId, CategoryId = catCake.CategoryId,
                        Name = "Matcha Tiramisu", BasePrice = 58000, Rating = 4.8m,
                        Description = "Sự kết hợp hoàn mỹ giữa phô mai Mascarpone béo dịu và bột matcha Uji nguyên chất.",
                        ImageUrl = "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80",
                        IsFeatured = false, IsAvailable = true, SortOrder = 15
                    },

                    // Quà Lưu Niệm
                    new MenuItem {
                        TenantId = tenant.TenantId, CategoryId = catGift.CategoryId,
                        Name = "Signature Ceramic Mug", BasePrice = 120000, Rating = 4.9m,
                        Description = "Ly gốm sứ Bát Tràng tráng men thủ công cao cấp in logo kỷ niệm độc bản.",
                        ImageUrl = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80",
                        IsFeatured = false, IsAvailable = true, SortOrder = 16
                    },
                    new MenuItem {
                        TenantId = tenant.TenantId, CategoryId = catGift.CategoryId,
                        Name = "Artisanal Coffee Beans 250g", BasePrice = 165000, Rating = 5.0m,
                        Description = "Hạt cà phê Arabica Cầu Đất rang mộc thượng hạng chuẩn gu Specialty Coffee.",
                        ImageUrl = "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=500&q=80",
                        IsFeatured = true, IsAvailable = true, SortOrder = 17
                    }
                };

                db.MenuItems.AddRange(menuItems);
                await db.SaveChangesAsync();

                // Link sizes & toppings
                foreach (var item in menuItems)
                {
                    db.MenuItemSizes.Add(new MenuItemSize { MenuItemId = item.MenuItemId, SizeId = sizeM.SizeId, ExtraPrice = 0 });
                    db.MenuItemSizes.Add(new MenuItemSize { MenuItemId = item.MenuItemId, SizeId = sizeL.SizeId, ExtraPrice = 15000 });

                    if (item.CategoryId == catMilkTea.CategoryId || item.CategoryId == catTea.CategoryId)
                    {
                        db.MenuItemToppings.Add(new MenuItemTopping { MenuItemId = item.MenuItemId, ToppingId = topBoba.ToppingId });
                        db.MenuItemToppings.Add(new MenuItemTopping { MenuItemId = item.MenuItemId, ToppingId = topWhiteBoba.ToppingId });
                        db.MenuItemToppings.Add(new MenuItemTopping { MenuItemId = item.MenuItemId, ToppingId = topPudding.ToppingId });
                        db.MenuItemToppings.Add(new MenuItemTopping { MenuItemId = item.MenuItemId, ToppingId = topCheese.ToppingId });
                    }
                }

                await db.SaveChangesAsync();
            }

            // 5. Ensure 10 Tables
            if (!await db.Tables.AnyAsync(t => t.StoreId == store1.StoreId))
            {
                for (int i = 1; i <= 10; i++)
                {
                    db.Tables.Add(new Table
                    {
                        StoreId = store1.StoreId,
                        TableNumber = $"T{i:D2}",
                        QRCodeUrl = $"/qr/T{i:D2}.png",
                        Status = "Available",
                        Capacity = 4,
                        IsActive = true
                    });
                }
                await db.SaveChangesAsync();
            }

            // 6. Ensure Voucher
            if (!await db.Vouchers.AnyAsync(v => v.TenantId == tenant.TenantId))
            {
                db.Vouchers.Add(new Voucher
                {
                    TenantId = tenant.TenantId,
                    Code = "WELCOME50",
                    Title = "Giảm giá khách hàng mới",
                    DiscountType = "percent",
                    DiscountValue = 10,
                    MinOrderAmount = 50000,
                    MaxDiscount = 20000,
                    StartDate = DateTime.UtcNow.AddDays(-10),
                    EndDate = DateTime.UtcNow.AddMonths(3),
                    MaxUsageTotal = 1000,
                    UsedCount = 0,
                    IsActive = true
                });
                await db.SaveChangesAsync();
            }
        }
    }
}
