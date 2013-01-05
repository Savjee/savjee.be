# Run Jekyll
echo "################## Running Jekyll ##################"
Jekyll

# Upload to S3!
echo -e "\n\n\n################## Uploading to S3 ##################"

#s3cmd sync --acl-public --exclude '.DS_Store' --exclude '*.png' --delete-removed --reduced-redundancy _site/ s3://s3.savjee.be
#s3cmd sync --acl-public --exclude '.DS_Store' --add-header="Expires: Sat, 20 Nov 2286 18:46:39 GMT" --delete-removed --reduced-redundancy _site/assets/ s3://s3.savjee.be/assets/

# Sync Assets first!
s3cmd sync --acl-public --exclude '*.*' --include '*.png'  --include  '*.css' --include '*.js' --add-header="Expires: Sat, 20 Nov 2286 18:46:39 GMT" --delete-removed --reduced-redundancy _site/assets/ s3://s3.savjee.be/assets/

# Sync everything else, but ignore the assets!
s3cmd sync --acl-public --exclude '.DS_Store' --exclude 'assets/' --delete-removed --reduced-redundancy _site/ s3://s3.savjee.be
