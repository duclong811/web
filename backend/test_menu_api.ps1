$response = Invoke-RestMethod -Uri "http://localhost:5277/api/Menu/store/1" -Method Get
Write-Host "Store: $($response.data.storeName)"
Write-Host "Total Categories: $($response.data.categories.Count)"
foreach ($c in $response.data.categories) {
    Write-Host "  * Category: $($c.name)"
}
Write-Host "Total MenuItems: $($response.data.menuItems.Count)"
foreach ($item in $response.data.menuItems) {
    Write-Host "  - $($item.name) | $($item.categoryName) | $($item.basePrice) VND"
}
