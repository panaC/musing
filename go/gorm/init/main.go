package main

import (
	"errors"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Product struct {
	// gorm.Model
	ID uint `gorm:"primaryKey"`
	// doesn't work so need to generate a custom uuid
	// ID    string `gorm:"default:uuid_generate_v4()"`
	Code  string
	Price uint
}

func main() {

	var db, err = gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// Migrate the schema
	db.AutoMigrate(&Product{})

	var product Product

	// Check if returns RecordNotFound error
	err2 := db.First(&product, 100).Error
	if errors.Is(err2, gorm.ErrRecordNotFound) {
		print("ooups\n")
	}

	// Create
	db.Create(&Product{Code: "D42", Price: 100})

	print("hello\n")

	// Read

	err3 := db.First(&product, 1).Error // find product with integer primary key
	if errors.Is(err3, gorm.ErrRecordNotFound) {
		print("ooups3\n")
	}

	print("hello\n")
	print(product.Code)

	db.First(&product, "code = ?", "D42") // find product with code D42
	// Update - update product's price to 200
	db.Model(&product).Update("Price", 200)
	// Update - update multiple fields
	db.Model(&product).Updates(Product{Price: 200, Code: "F42"}) // non-zero fields
	db.Model(&product).Updates(map[string]interface{}{"Price": 200, "Code": "F42"})

	// Delete - delete product
	db.Delete(&product, 1)
}
