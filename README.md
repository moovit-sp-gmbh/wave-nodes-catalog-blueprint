# helmut.cloud catalog

This repository serves as a base for creating new node catalogs to be used in helmut.cloud stream designs.

## Constructing your catalog

### Catalog

Your catalog is defined using the Catalog constructor. The index.ts file should have a Catalog instance has its default export to allow the build scripts to function properly.

A Catalog consists of a name, description, logo and a series of nodes. Nodes are any class that extends the Node class.

### Node

Any class that extends the Node class is required to define its specification and its execution logic. Any packages can be used here as they will all be bundled with the source code when publishing.

## Testing your nodes

To test your nodes it is necessary to have a [helmut.cloud Agent](https://app.helmut.cloud/account/user/downloads) running locally. You should then go to [this URL](http://localhost:6968/api/agent/v1/modules/dev-wave/) and submit the root directory of this repository. Alternatively you can use the `link` command to do the same.

    npm run link

After that you will need to paste the node specification in the search bar of the Stream Designer Studio. You can obtain this using the `spec` script and copying the JSON written to standard out. The `--silent` argument is important to prevent npm from writing to stdout if you want to pipe or redirect the command output.

    npm run --silent spec -- <name of your node>

In the future this process will become more streamlined as we improve the external catalog development experience.

## Publishing your catalog

Publishing your catalog will happen automatically whenever a new tag is pushed. A GitHub action is set to bundle the catalog and upload it to a specified S3 storage bucket. You will need to update the [upload-to-s3.yml](./.github/workflows/upload-to-s3.yaml) file to get the correct information for your S3 storage.

## Staying in sync

We recommend adding this repo as a remote so that you can make sure your catalog is up-to-date.

    git remote add blueprint https://github.com/moovit-sp-gmbh/wave-nodes-catalog-blueprint.git
    git fetch blueprint
    git rebase blueprint/main // You can also choose to merge instead of rebase

As long as you make no changes to the `Node` and `Catalog` classes merge/rebase conflicts should be minimal. Should you need to extend these classes in anyway we recommend creating new classes that extend them to avoid future conflicts. The `index.ts` file can export an instance of any class that extends `Catalog`.
