import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';
import { ProductsModule } from './products/products.module';
import { HealthModule } from './health/health.module';

const isProduction = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // In production, generate schema in memory; in development, write to file for tooling
      autoSchemaFile: isProduction ? true : join(__dirname, 'schema.gql'),
      introspection: true,
      playground: false,
      // Use production landing page in production, Apollo Sandbox in development
      plugins: [
        isProduction
          ? ApolloServerPluginLandingPageProductionDefault()
          : ApolloServerPluginLandingPageLocalDefault({
              embed: true,
              includeCookies: true,
            }),
      ],
      // Disable CSRF for local development (Docker/localhost)
      csrfPrevention: isProduction,
    }),
    ProductsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
