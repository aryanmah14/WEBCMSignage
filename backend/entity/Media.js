const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Media", // Will use table name `media` by default
    tableName: "media",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        url: {
            type: "text",
        },
        type: {
            type: "varchar",
        },
        s3_key: {
            type: "text",
            nullable: true,
        },
        is_enabled: {
            type: "boolean",
            default: true,
        },
        duration: {
            type: "int",
            default: 3000, // Default 3 seconds
        },
        created_at: {
            type: "timestamp",
            createDate: true, // Automatically manages created_at
        },
    },
});
