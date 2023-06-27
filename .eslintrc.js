module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "globals": {
      "__dirname": "readonly",
      "process": "readonly",
      "_": "readonly"
    },
    "extends": "eslint:recommended",
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "ignorePatterns": ["node_modules/", "out/", "img/", "tests/", "**/*.json", "**/*.html", "**/*.css"],
    "rules": {
    }
}
