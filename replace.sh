#!/bin/bash

# 用法: ./replace.sh 1.98.2,1.99.0 https://your.cdn.com/static

if [ $# -ne 2 ]; then
  echo "用法: $0 版本号1,版本号2,... 资源URL"
  exit 1
fi

VERSIONS=$(echo "$1" | tr ',' '\n')
ASSETS_URL=${2%/} # 去掉结尾的 /

for VERSION in $VERSIONS; do
  DIR="static/$VERSION"
  TMP_FILE="$DIR/index_tmp.html"
  OUT_FILE="$DIR/index.html"
  if [ ! -f "$TMP_FILE" ]; then
    echo "未找到 $TMP_FILE，跳过"
    continue
  fi
  sed "s#{{assets_url}}#$ASSETS_URL#g" "$TMP_FILE" > "$OUT_FILE"
  echo "已生成: $OUT_FILE"
done
